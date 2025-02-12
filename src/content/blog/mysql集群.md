---
title: mysql集群
description: 
tags:
  - 无标签
pubDate: 2021-04-04
---


## 主从架构



<!-- more -->



其实就是一个master服务器和一个slave服务器



master服务器主要负责平常的读和写，而slave就是要同步master的数据



同步原理



![image-20210404121918522](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210404121918522.png)



1. 从库上有个io线程与主库进行tcp连接

2. 这个io线程请求主库将binlog传输给自己，主库上有个io dump线程，负责通过这个tcp连接把binglog日志传输给从库的io线程

3. 从库的io线程会把读取到的binlog日志写入到自己的本地的中转（relaylog）日志中

4. 从库中另外一个sql线程会读取relay日志里的内容，进行日志重做，把所有主库执行过的增删改查，在从库上执行一遍，做到数据和主库的数据一致



> 从库可以设置为只读（readonly）模式

>

> - 有时候一些运营类的查询语句会被放到备库上去查，设置为只读可以防止误操作；

> - 防止切换逻辑有 bug，比如切换过程中出现双写，造成主备不一致；

> - 可以用 readonly 状态，来判断节点的角色。

>

> 你可能会问，我把备库设置成只读了，还怎么跟主库保持同步更新呢？

>

> 因为 readonly 设置对超级 (super) 权限用户是无效的，而用于同步更新的线程，就拥有超级权限。

>

> 建议log_slave_updates 设置为 on，表示备库执行 relay log 后生成 binlog



### 读写分离



### 半同步复制



1. after_commit   主库写入数据到binlog，等到binlog传输给从库，主库就提交事务，接着等待从库返回给自己一个成功的响应，然后主库返回提交事务成功的响应给客户端

2. mysql5.7默认的 主库写入数据到binlog，将binlog传输给从库，从库写入成功，给主库返回响应，主库才提交事务，接着返回事务成功的响应给客户端



```sql

#检查半同步复制是否正常运行

shwo global status like '%semi%';

如果看到了Rpl_semi_sync_master_status的状态是on，就表示开启的

```



### 主从延迟



使用percona-toolkit工具集里的pt-hearbeat工具，他会在主库中创建一个hearbeat表，然后有一个线程定时更细这个表里的时间戳字段，从库上就会有一个monitor线程会负责检查从库同步古来的hearbeat表的的时间戳



把时间戳跟当前时间戳比较一个下，就知道主从同步落后了多长时间



> 解决办法：

>

> mysql5.7已经支持并行复制了，在从库中设置slave_parallel_workers>0 然后把slave_parallel_type设置为 logical_clock 就ok了

>

> 如果想要刚写入的数据立马强制必须一定可以读到，可以利用类似mycat或者sharding-spherre之类的中间件里设置强制读写都从主库从，这样你写入主库的数据，强制从主库里读取，一定立即可以读到



#### 三个原因



1. 备库的压力大



2. 备库所在机器的性能要比主库所在的机器性能差



3. 大事务



   > - 不建议一次性地用 delete 语句删除太多数据



4. 备库的并行复制能力



### 高可用



一般生产环境使用MHA，Master High Availablility Magager and Tools for Mysql，日本人写的，用perl脚本写的一个工具，这个工具就是专门用于监控主库的状态，如果感觉不对，可以把从库切换为主库



这MHA也是需要单独部署的，分为manager和node。manager节点一般是单独部署一台机器的，node节点一般是部署在每台myslq机器上的额，因为node节点需要通过解析各个myslq的日志来进行一些分析



### 单表



建议mysql的单表数据量不要超过1000万，最好是在500万之内，如果能控制在100万以内，那是最佳的选择，基本单表在100万以内的数据，性能上不会有太大的问题，前提是你做好索引



> 一般一亿行数据，大小在一个g到几个g之间