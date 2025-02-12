---
title: mysql执行流程
description: ""
tags:
  - 无标签
pubDate: 2021-03-24
---


### 基本流程



<!-- more -->



![image-20210325191751923](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210325191751923.png)



上图就是mysql的基本流程



#### 连接器



账号密码输入之后即可登录



连接的方式分为两种：



- 长连接：连接成功后，如果客户端持续有请求，则一直使用同一连接，

- 短连接：指每次执行完很少的几次查询就断开连接，下次查询再重新建立一个



> 建立连接的过程通常是比较复杂的，所以我建议你在使用中要尽量减少建立连接的动作，也就是尽量使用长连接



但是全部使用长连接后，你可能会发现，有些时候 MySQL 占用内存涨得特别快，这是因为 MySQL 在执行过程中临时使用的内存是管理在连接对象里面的。这些资源会在连接断开的时候才释放。所以如果长连接累积下来，可能导致内存占用太大，被系统强行杀掉（OOM），从现象看就是 MySQL 异常重启了。



怎么解决这个问题呢？你可以考虑以下两种方案。



1. 定期断开长连接。使用一段时间，或者程序里面判断执行过一个占用内存的大查询后，断开连接，之后要查询再重连。

2. 如果你用的是 MySQL 5.7 或更新版本，可以在每次执行一个比较大的操作后，通过执行 mysql_reset_connection 来重新初始化连接资源。这个过程不需要重连和重新做权限验证，但是会将连接恢复到刚刚创建完时的状态。



#### 解析器



这个解析器的功能，其实很好理解，就是用来识别关键字的，比如常见的select delete create等等，同时也要检查你写的sql语句语法是否有问题，有问题的就是直接返回



#### 优化器



多索引的时候，一般会选择在索引里扫描行数比比较少的那个条件



或者join连接的时候，先连接哪个表



##### 成本计算



![image-20210404081651310](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210404081651310.png)



##### sql改写



就是会对你的sql语句进行一些优化，更加明确sql语句的语义







#### 执行器



经过前面两个步骤之后，到这里mysql才真正开始执行你写的sql语句，但是它会判断当前这个用户是否有这个操作的权限，如果有，则执行sql语句，如果没有，则返回没有权限的错误



> 引擎扫描行数跟 rows_examined 并不是完全相同的



#### innodb引擎



引擎执行sql语句的时候，也并不是直接去磁盘中查找的，而是要先在缓存中进行查找，在缓存中找不到的话，才会从磁盘中将数据加载到缓存中，然后从缓存中读取



这个缓存层，在mysql中人们习惯称之为buffer pool



#### Buffer Pool



![image-20210328085710305](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210328085710305.png)



上图其实就是buffer pool的执行流程



1. 首先是判断数据是否在buffer pool中，如果在的话，直接更新数据，如果不在，则直接去磁盘中请求相应数据，然后刷入到buffer pool中，再从buffer pool中读取

2. 更新undolog到磁盘中，undolog的作用其实非常清楚，它主要是用于回滚事务的，比如你这个事务没有执行成功，它就依靠undolog来进行回滚

3. 将更新数据的操作写入到redolog buffer中

4. 将更新数据的操作写入到binlog中

5. 提交redolog的commit，将redolog写入到os cache中，然后根据redolog的参数来决定os cache的刷盘策略



##### redolog



作用：主要用来出现意外情况，数据还在内存当中，但是机器宕机的场景



redo log里本质上记录的就是在对某个表空间的某个数据页的某个偏移量的地方修改了



[redolog与binlog的区别](https://mp.weixin.qq.com/s/XTpoYW--6PTqotcC8tpF2A)



redolog 在缓存中叫做redolog buffer，在磁盘中叫做 redolog file。



> redologbuffer 默认为16MB



两段式提交，数据刷新到内存，然后刷新到redolog buffer上，此时redolog是处于prepare阶段，然后mysql将数据刷新到binlog上，binlog写入成功之后，提交给redolog一个commit，此时redolog才算刚刚结束，接着要把redolog buffer刷入到os cache中，然后根据redolog的参数来决定os cache的刷盘策略



> redolog buffer刷新到磁盘中是有方法的，在redolog buffer没有写满的时候，采用追加写的方式，当redolog buffer 写满的时候，



了解了redo log的写入方式之后，我们发现主要完成的操作是redo log buffer 到磁盘的redo log file的写入过程，其中需要经过OS buffer进行中转。关于redo log buffer写入redo log file的时机，可以通过 参数innodb_flush_log_at_trx_commit 进行配置，各参数值含义如下：



- l参数为0的时候，称为“延迟写”。事务提交时不会将redo log buffer中日志写入到OS buffer，而是每秒写入OS buffer并调用写入到redo log file中。换句话说，这种方式每秒会发起写入磁盘的操作，假设系统崩溃，只会丢失1秒钟的数据。



- l参数为1 的时候，称为“实时写，实时刷”。事务每次提交都会将redo log buffer中的日志写入OS buffer并保存到redo log file中。其有点是，即使系统崩溃也不会丢失任何数据，缺点也很明显就是每次事务提交都要进行磁盘操作，性能较差。



- l参数为2的时候，称为“实时写，延迟刷”。每次事务提交写入到OS buffer，然后是每秒将日志写入到redo log file。这样性能会好点，缺点是在系统崩溃的时候会丢失1秒中的事务数据。



###### 结构



日志类型（就是类似MLOG_1BYTE之类的），表空间ID，数据页号，数据页中的偏移量，具体修改的数据



redo log就划分为了不同的类型，MLOG_1BYTE类型的日志指的就是修改了1个字节的值，MLOG_2BYTE类型的日志指的就是修改了2个字节的值，以此类推，还有修改了4个字节的值的日志类型，修改了8个字节的值的日志类型。



当然，如果你要是一下子修改了一大串的值，类型就是MLOG_WRITE_STRING，就是代表你一下子在那个数据页的某个偏移量的位置插入或者修改了一大串的值。



MLOG_WRITE_STRING类型的日志，因为不知道具体修改了多少字节的数据，所以其实会多一个修改数据长度，就告诉你他这次修改了多少字节的数据，如下所示他的格式：



日志类型（就是类似MLOG_1BYTE之类的），表空间ID，数据页号，数据页中的偏移量，修改数据长度，具体修改的数据



###### 组成



redolog buffer里面有很多条数据，那它刷新到磁盘的时候，总不可能一条数据一条数据刷吧，那样性能就太差了，所以说有了redolog block这个数据结构



redolog block中存放了许多个单行日志，刷新到磁盘按照redolog block来刷新



> 一个block最多放496个自己的redo log日志

>

> ，一个redolog block 是512字节，这个redolog block的512字节分成三个部分

>

> 1. 12字节的header快头

>    - 4个字节的block no，块的唯一编号

>    - 2个字节的data length，就是block里面写入了多少字节数据

>    - 2个字节的first record group 这个是说每个事务都会有多个redo log，就是一个redolog group，即一组redo log。那么在这个block里的第一组的redolog的偏移量，就是这个两个字节存储的

>    - 4个字节的checkpoint on

> 2. 496字节的body块体

> 3. 4字节的trailer块尾



![image-20210330064652434](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210330064652434.png)



###### 事务



在进行一个事务的时候，由于一个事务要进行多个增删改查的操作，所以一般都是将这些redolog先在别的地方存放，等到都转型完毕了，就把这一组redolog写入到redolog bufer中



###### 刷盘时机



1. 如果写入redolog bufer 的日志已经占据了redolog buffer总容量的一半，就会开始刷盘

2. 一个事务提交的时候，必须把它那些redolog 所在的redolog block刷入到磁盘中去，只有这样，才可以保证事务提交之后，他提交的数据绝对不会丢失。因为redolog有日志记录，随时可以回复事务做的修改

3. 后台线程定时刷新，有一个线程每个1秒就会吧redolog buffer中的redolog block刷入到磁盘文件

4. mysql关闭的时候，redolog buffer全部刷新到磁盘中



###### 参数



InnoDB 提供了 innodb_flush_log_at_trx_commit 参数，它有三种可能取值：



- 设置为 0 的时候，表示每次事务提交时都只是把 redo log 留在 redo log buffer 中 ;

- 设置为 1 的时候，表示每次事务提交时都将 redo log 直接持久化到磁盘；

- 设置为 2 的时候，表示每次事务提交时都只是把 redo log 写到 page cache。



>一个没有提交的事务的 redo log，也是可能已经持久化到磁盘的。



###### 组提交



日志逻辑序列号（log sequence number，LSN）的概念。LSN 是单调递增的，用来对应 redo log 的一个个写入点。每次写入长度为 length 的 redo log， LSN 的值就会加上 length。



>LSN 也会写到 InnoDB 的数据页中，来确保数据页不会被多次执行重复的 redo log。



比如说有三个事务并发提交了，对应的 LSN 分别是 50、120 和 160,如果50的lsn对应的事务先到达os cache之后，它就会成为leader，等到它开始要进行刷盘的时候，此时这个组里面已经有三个事务了，lsn变为了160，所以这个事务写盘的时候，带的lsn是160，因此等 这个事务返回时，所有 LSN 小于等于 160 的 redo log，都已经被持久化到磁盘；



###### 命令



```bash

#查看redolog目录

show variables like 'datadir'

#设置redolog目录

innodb_log_group_home_dir

#redolog默认为48MB，默认有两个日志文件innodb_log_files_in_group

innodb_log_file_size

```



##### binlog



作用：主要用来进行主从备份的



###### 刷盘方式



- sync_binlog=0 的时候，表示每次提交事务都只 write，不 fsync；

- sync_binlog=1 的时候，表示每次提交事务都会执行 fsync；

- sync_binlog=N(N>1) 的时候，表示每次提交事务都 write，但累积 N 个事务后才 fsync。



>在出现 IO 瓶颈的场景里，将 sync_binlog 设置成一个比较大的值，可以提升性能。在实际的业务场景中，考虑到丢失日志量的可控性，一般不建议将这个参数设成 0，比较常见的是将其设置为 100~1000 中的某个数值。但是，将 sync_binlog 设置为 N，对应的风险是：如果主机发生异常重启，会丢失最近 N 个事务的 binlog 日志。



###### 组提交



如果你想提升 binlog 组提交的效果，可以通过设置 binlog_group_commit_sync_delay 和 binlog_group_commit_sync_no_delay_count 来实现。



- binlog_group_commit_sync_delay 参数，表示延迟多少微秒后才调用 fsync;



- binlog_group_commit_sync_no_delay_count 参数，表示累积多少次以后才调用 fsync。、



  > 这两个条件是或的关系，也就是说只要有一个满足条件就会调用 fsync。所以，当 binlog_group_commit_sync_delay 设置为 0 的时候，binlog_group_commit_sync_no_delay_count 也无效了。



###### 格式



主要分为三种格式，statement row和mixed



- statement 格式下，记录到 binlog 里的是语句原文，就是你在mysql中执行的是什么语句，在binlog也是同样的语句，但是这样可能会导致出现索引不通的情况出现，当索引不通的时候，你在执行delete的时候还使用了limit，那么就会出现错误删除的情况

- rpw 格式下，记录的是哪个表，删除的主键id是什么，所以是不会执行错误的，但是它同样有一个缺点，就是当数据量大的时候，非常消耗空间

- ，mixed其实就是前两种格式的融合



> mixed的来源

>

> - 因为有些 statement 格式的 binlog 可能会导致主备不一致，所以要使用 row 格式。

> - 但 row 格式的缺点是，很占空间。比如你用一个 delete 语句删掉 10 万行数据，用 statement 的话就是一个 SQL 语句被记录到 binlog 中，占用几十个字节的空间。但如果用 row 格式的 binlog，就要把这 10 万条记录都写到 binlog 中。这样做，不仅会占用更大的空间，同时写 binlog 也要耗费 IO 资源，影响执行速度。

> - 所以，MySQL 就取了个折中方案，也就是有了 mixed 格式的 binlog。mixed 格式的意思是，MySQL 自己会判断这条 SQL 语句是否可能引起主备不一致，如果有可能，就用 row 格式，否则就用 statement 格式。



##### undolog



undolog这个日志主要是用来进行事务回滚的，一般只有进行数据变动的时候才会有undolog，比如update insert delete，但是select 是没有的，因为select只是获取数据，并没有对数据进行变更



比如你插入一条数据，undolog中记录的是 删除一条数据，是和你进行操作的行为是相反的



###### 结构



- 这条日志开始的问题只

- 主键的各列长度和值，主键可能是你设置的表的主键，也可能是三个字段组成的联合主键，也有可能是myslq默认添加的row_id作为主键

- 表id

- undolog日志编号

- undolog日志类型 ，比如 insert语句的undolog的日志类型是 TRX_UNDO_INSERT_REC

- 这条日志的结束位置



##### 区别



1. redo log 是 InnoDB 引擎特有的；binlog 是 MySQL 的 Server 层实现的，所有引擎都可以使用。

2. redo log 是物理日志，记录的是“在某个数据页上做了什么修改”；binlog 是逻辑日志，记录的是这个语句的原始逻辑，比如“给 ID=2 这一行的 c 字段加 1 ”

3. redo log 是循环写的，空间固定会用完；binlog 是可以追加写入的。“追加写”是指 binlog 文件写到一定大小后会切换到下一个，并不会覆盖以前的日志。



> 为什么 binlog cache 是每个线程自己维护的，而 redo log buffer 是全局共用的？

>

> MySQL 这么设计的主要原因是，binlog 是不能“被打断的”。一个事务的 binlog 必须连续写，因此要整个事务完成后，再一起写到文件里。



##### 非双1



一般情况下，把生产库改成“非双 1”配置，是设置 innodb_flush_logs_at_trx_commit=2、sync_binlog=1000。



### **crash-safe**



即在 InnoDB 存储引擎中，事务提交过程中任何阶段，MySQL突然奔溃，重启后都能保证事务的完整性，已提交的数据不会丢失，未提交完整的数据会自动进行回滚



这个能力依赖的就是redo log和unod log两个日志。



实际上数据库的 crash-safe 保证的是：



- 如果客户端收到事务成功的消息，事务就一定持久化了；

- 如果客户端收到事务失败（比如主键冲突、回滚等）的消息，事务就一定失败了；

- 如果客户端收到“执行异常”的消息，应用需要重连后通过查询当前状态来继续后续的逻辑。此时数据库只需要保证内部（数据和日志之间，主库和备库之间）一致就可以了。



### 磁盘文件



磁盘文件有三个层级



1. 一组数据组，是256个数据区

2. 一个数据区，是64个数据页

3. 一个数据页，是16kb



在磁盘中把一页的数据叫做数据页，在缓存中，称之为缓存页


