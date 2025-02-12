---
title: redis cluster
description: 
tags:
  - 无标签
pubDate: 2021-03-21
---


### 集群配置



<!-- more -->



```bash

mkdir -p /etc/redis-cluster

mkdir -p /var/log/redis

mkdir -p /var/redis/7001

#配置文件目录

/var/redis/7001.conf

#redis.conf

port 7001

cluster-enabled yes

cluster-conifg-file /etc/redis-cluster/node/7001.conf

cluster-node-timeout 15000

daemonize yes

pidfile /var/run/redis_7001.conf

dir /var/redis/7001

logfile /var/log/redis/7001.log

bind 192.168.0.21

appendonly yes 

```



至少要3个master节点启动，每个master加一个slave节点，先选择6个节点，启动6个实例



```bash

yum install -y ruby

yum install -y rubygems

gem install redis

cp /home/redis/src/redis.trib.rm /usr/local/bin

 

redis-trib.rb create --replicas 1 192.168.0.21:7001 192.168.0.21:7002 192.168.0.22:7003 192.168.0.22:7004 192.168.0.23:7005 192.168.0.23:7006

#查看redis.cluster对于主从节点的配置信息

redis-cli --cluster check 192.168.0.21:7001



#测试

redis-cli -h 192.168.0.22 -p 7004

 #自动写入对应的机器

redis-cli -h 192.168.0.22 -p 7004 -c

#将节点加入到redis-cluster集群中

redis-cli --cluster add-node 192.168.0.21:7007 192.168.0.22:7004

#加入salve节点

redis-cli --cluster add-node --slave --master-id c1dcc6197201c958fb06fa7737190e4209dc2171 192.168.0.22:7008 192.168.0.22:7004

 #删除一个节点，要把它上面的slot移动到其他机器上

  

```



多master写入



每条数据上只存在于一个master上，不同master负责存储不同的数据



当你清空一个master的hashslot的时候，redis cluster会将其slace挂载到其他master上去，这个时候，你只需要删除这个节点就可以了



### 扩容



redis-cli --cluster reshard 192.168.0.21:7001



![image-20210322160409452](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210322160409452.png)



### 读写分离



redis-cluster可以实现物理的读写分离即一个redis专门用来读数据，一个redis专门用来写数据，但是一般不建议使用，现在用的都是master负责读写，而slave只是数据备份



默认不支持slave节点读或者写



在slave中要先执行readlonly，再执行get命令，才可以取到数据



### 自动化slave迁移



当master的slave挂掉了，其他有冗余的slave会将自动将其slave挂在到缺失slave的master



#### why



为什么不进行读写分离那



原因是因为之前我们让物理的读写分离，是在一主多从的情况下，想要增加访问量，就是要增加slave的数量，这样才可以达到水平扩容的效果，但是用了redis.cluster之后，是多主多从的情况，因此要想增加屯库量直接增加master的数量就可以了



### 机器配置



redis的内存不建议太大，一般是8g或者16g，如果内存比较大，redis在fork子线程的时候，可能会造成机器卡顿



### 原理



#### 基础通信原理



各个节点之间通过gossip协议进行通信



跟集中式不通，不是讲集群元数据放在某一个节点上，而是互相之间不断通信，保持整个集群所有节点的数据是完整的



集中式存储



![image-20210322160443703](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210322160443703.png)



#### 10000端口



每个节点都有一个专门用于节点间通信的端口，就是自己提供服务端口号+10000，比如7001，那么用于通信的就是17001，每个节点每隔一段时间会往另外几个节点发送pin消息，同时其他节点接受到ping之后会返回pong



#### 交换信息



故障信息，节点的增加和移除，hashslot信息 等



#### gossip



gossip协议包括多种信息，包括 Ping pong meet fail等



meet：某个节点发送meet给新加入的节点，让新节点加入集群中，然后新节点就会开始与其他节点通信



ping： 每个节点都会频繁的给其他节点发送ping，其中包含自己的状态和自己维护的集群元数据，互相通过ping来交换元数据



每个节点每隔10秒回执行10次ping，每次会选择5个最久没有通信的其他节点，如果发现某个节点的通信延时达到了cluster_*node_*out/2，那么立即发送ping，避免数据交换延迟过长



每次ping，一个是带上自己的节点的信息，还有就是带上十分之一的其他节点的信息发送出去，进行数据交换



至少包含3个其他节点的信息，最多包含总节点-2个其他节点的信息



pong： 返回ping和meet，包含自己的状态和其他等信息，也可以用于信息广播和更新



fail： 某个节点判断另一个节点fail之后，就发送fail给其他节点，通知其他节点，指定的节点宕机了



## 测试



![image-20210322160504870](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210322160504870.png)



图中出现的是moved的意思是应该到192.168.0.23的机器上 ，端口为7005的机器上进行这个命令的写入



每个机器在执行命令的时候，都会计算这key对应的crc16的值，然后对16384的hashslot取模，找到对应的hashslot，并且返回该hashslo所对应的机器及端口号



自动将命令执行在对应的机器上



redis-cli -h 192.168.0.21 -p 7001 -c



重启之后的日志