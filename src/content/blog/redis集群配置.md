---
title: redis集群配置
description: ""
tags:
  - 无标签
pubDate: 2021-03-27
---


## 单机基本配置



<!-- more -->



```bash

#将redis目录下面utils中的redis_init_script复制到/etc/init.d/目录下，并且改为为redis_端口号

cp redis_init_script /etc/init.d/redis_6379

mkdir /etc/redis                  #存放redis的配置文件

mkdir /var/redis/6379             #存放redis的持久化文件

修改redis.conf拷贝到/etc/redis/6379.conf中

#修改redis.conf中的配置环境为生产环境

daemonize yes                     # 让redis以后台方式启动

pidfile /var/run/redis_6379.pid   #设置redis的pid文件位置

port 6379                         #设置redis的监听端口号

dir /var/redis/6379               #设置持久化文件的存储位置

#在任何目录下都可以使用redis_cli

sudo cp src/redis-cli /usr/local/bin/ 

sudo cp src/redis-server /usr/local/bin/ 

#启动redis

cd /etc/init.d/

chmod 777 6379.conf

./redis_6379.conf start

#让redis开机自动启动，在redis_6379的最上面加入下面两行注释

#chkconifg:2345 90 10

#description:Redis is a persistent key-value database

#--------------------------

#在当前目录下执行下面这个命令

chkconfig redis_6379 on

#查看redis是否启动

ps -ef |grep redis 

```

## 主从复制配置

### master

在redis的配置文件中，即/etc/redis/6379.conf

```bash

bind 自己的ip地址

requirepass 密钥（自己随意设置即可）

```

### slave

```bash

bind 自己的ip地址

masterauth  上面master设置的密钥

replicaof（比较旧的版本是slaveof） aster的IP地址  端口号（一般默认为6379）

```

### 启动redis

```bash

注意：先启动master再启动slave

#启动redis   进入到/etc/init.d/目录下

./redis.6379 start

#进入redis,设置了requirepass的服务器需要输入密钥，没有设置的不需要，也就是说master是需要输入，而slave不需要输入密钥

 redisl-cli -h 当前服务器的ip地址  -a  设置的密钥

 #在服务器中可以查看主从配置信息

 info replication 

```

#### master info replication



![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3dd32bfe31d74f9fa170d62f43227600~tplv-k3u1fbpfcp-watermark.image)

#### slave info replication



![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8d84bb27a385400495429d7b7e0021cb~tplv-k3u1fbpfcp-watermark.image)

### 问题

#### ping通，但是telnet不通

1. 如果你在从的redis中看见master_link——status 状态是down，可能是telnet到master的端口不通，执行telent master ip地址  redis设置的端口号（默认是6379）

2. 如果发现没有telnet命令，需要执行 yum install -y telnet   

3. 如果yum出现问题，修改yum的源文件，vim /etc/yum.repos.d/ epel.repo   

将下图中的metalink注释起来，将baseurl取消注释，下图是修改后的结果

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bf0ba8e566b4b8aa1282bfaa063a8a6~tplv-k3u1fbpfcp-watermark.image)

4. telnet安装之后，还是slave 可以ping通master，但是telnet不通，这种情况一般就是服务器的防火墙的问题，可以选择直接将服务器关闭

```bash

#关闭开机自动启动防火墙

systemctl disable firewalld.service 

#查看防火墙的状态

firewall-cmd --state

#临时关闭防火墙

systemctl stop firewalld.service

```