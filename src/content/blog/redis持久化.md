---
title: redis持久化
description: ""
tags:
  - 无标签
pubDate: 2021-05-09
---


介绍redis的两种持久化方式rdb和aof



<!-- more -->



# rdb



RDB方式，是将redis某一时刻的数据持久化到磁盘中，是一种快照式的持久化方法。



有两个Redis命令可以用于生成RDB文件，一个是SAVE，另一个是BGSAVE。



RDB文件的载入工作是在服务器启动时自动执行的，所以Redis并没有专门用于载入RDB文件的命令，只要Redis服务器在启动时检测到RDB文件存在，它就会自动载入RDB文件。



> 如果服务器开启了AOF持久化功能，那么服务器会优先使用AOF文件来还原数据库状态。只

>

> 有在AOF持久化功能处于关闭状态时，服务器才会使用RDB文件来还原数据库状态。

>

> 服务器在载入RDB文件期间，会一直处于阻塞状态，直到载入工作完成为止。



## save



SAVE命令会阻塞Redis服务器进程，直到RDB文件创建完毕为止，在服务器进程阻塞期间，服务器不能处理任何命令请求：



## bgsave



BGSAVE命令会派生出一个子进程，然后由子进程负责创建RDB文件，服务器进程（父进程）继续处理命令请求：



在这个命令执行期间，服务器处理SAVE、BGSAVE、BGREWRITEAOF三个命令的方式会和平时有所不同。



1. 客户端发送的SAVE命令会被服务器拒绝，服务器禁止SAVE命令和BGSAVE命令同时执行是为了避免父进程（服务器进程）和子进程同时执行两个rdbSave调用，防止产生竞争条件

2. 客户端发送的BGSAVE命令会被服务器拒绝，因为同时执行两个BGSAVE命令也会产生竞争条件。

3. BGREWRITEAOF和BGSAVE两个命令不能同时执行



> - 如果BGSAVE命令正在执行，那么客户端发送的BGREWRITEAOF命令会被延迟到BGSAVE命令执行完毕之后执行。

> - 如果BGREWRITEAOF命令正在执行，那么客户端发送的BGSAVE命令会被服务器拒绝。



在redis.conf的配置文件中，就有这样的条件来触发bgsave的命令



![image-20210509200449863](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210509200449863.png)



上面的意思我那第一个来举例说明



服务器在900秒之内，对数据库进行了至少1次修改。



只要满足上面任意一个条件都会触发bgsave的命令



问题来了，怎么自动触发bgsave那？



肯定是要有一个方法来触发的，就是服务器周期性操作函数serverCron，默认每隔100毫秒就会执行一次，其实的一项工作就是检查save选项所设置的保存条件是否已经满足，如果满足的话，就执行BGSAVE命令。



## 结构







# aof



AOF持久化是通过保存Redis服务器所执行的写命令来记录数据库状态的



## 实现



AOF持久化功能的实现可以分为命令追加（append）、文件写入、文件同步（sync）三个步骤。


