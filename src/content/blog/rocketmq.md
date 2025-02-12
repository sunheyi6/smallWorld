---
title: rocketmq
description: 
tags:
  - 无标签
pubDate: 2021-03-27
---


单机最多10万并发 阿里开发 



<!-- more -->



## 集群部署



### 架构图

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f5d27582a681480c9ed1870ba1d5c749~tplv-k3u1fbpfcp-watermark.image)

### 原理

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f13fbb8e198e4adcba63578c2eb05122~tplv-k3u1fbpfcp-watermark.image)

## 高可用



主从架构及多副本策略



Borker有主和副之分，master broker 主要负责写入



master borker 收到消息之后会同步给slave broker ，保证一个机器宕机之后，另一个机器有数据



slave broker固定时间会从master broker拉取数据，这就是所谓的主从同步



每个broker启动都要向所有的nameserver进行注册。



因为如果只是向个别nameserver进行注册的话，当一台nameserver宕机之后，就会丢失broker的信息



nameserver和borker之间有个心跳机制，保证当broker宕机之后，nameserver会及时感知到



> 每隔固定时间，broker会向nameserver发送心跳，nameserver会将这个最新心跳时间更新



nameserver每隔固定时间来扫描所有broker的心跳时间，如果超过一个数据，将认为这个broker宕机



心跳传输的时候，还会降



#### 消息获取来源



消息获取可能来自于master broker，也可能来自于slave broker



broker将消息返回给请求系统的时候，会向系统建议下一次消息请求要请求master broker或者slave broker，



#### 重点



rocketmq4.5之前不是完全的高可用模式，当master broker宕机之后，不会自动切换到slave broker，需要人手动修改



4.5之后，采用一种Dledger的机制来支持master broker宕机之后自动切换到slaver broker



Dledger采用的是raft算法



## 下载安装



```java

#下载rocketmq

https://github.com/apache/rocketmq



#下载dledger 

https://github.com/openmessaging/openmessaging-storage-dledger 

#可视化界面

https://github.com/apache/rocketmq-externals 

```



## 保证消息不丢失



### 发送消息到mq零丢失



1. 同步发送消息+反复多次重试



2. rocketmq事务消息机制，这个整体效果会更好一点



### mq收到消息之后零丢失



开启同步刷盘+主从架构同步机制



将数据写入磁盘后，并且将数据写入到slave broker的磁盘之后才返回给生产者，消息写入mq成功



### 消费者收到消息之后零丢失



rocketmq天然就保证了，因为rocketmq默认就是当消息处理之后才会返回给mq消息发送成功，而不是在执行消息处理逻辑之前就将成功的消息返回给mq了



## 幂等性



避免对同一



1. 业务方法判断，当重试的时候，提前发送一条消息到mq中查询这个条消息是否已经发送过了，如果有则不再发送，没有则发送



2. 状态查询 你写入到mq一条消息，将消息也写入到redis中，写入id和订单状态，当接口重复调用的时候，就去redis中年查询一下，根据id查询状态，成功则不再发送，失败则再次发送



redis这种方案有缺陷，还有可能会重复消费



就是你将消息发送到mq，没有来得及写redis，redis宕机了，重启之后会将重新发一次消息，这样就有两条消息了；所以一般来说推荐使用业务方法来进行判断



## 重复消息



会有专门的重试队列，最多重试16次，16次之后进入死信队列，死信队列的处理方式是自定义，看业务需求



当业务由于某种原因故障不能消费消息时,可以返回reconsume_laster,将消息加入到延时消息consumerGroup中进行消息的重试最大15次阶梯型重试,15失败后放入到死信队列中消费者则专门开启线程进行消费



## 消费者



消费者消费消息的方式有两种，一种是push，broker主动向consumer不定时发送消息；一种是pull，consumer不定时从broker拉取消息



### push



本质上也是消费者不停向broker发送消息拉取数据



消费者在处理完一批消息之后，会立马发送请求到broker拉取消息，看起来好像是broker不定时向消费者推送信息一样，其实是消费者不停向broker发送消息拉取数据



当请求发送到broker的时候，发现没有消息可以消费，就会让这个请求线程挂起，默认挂起15秒，然后后台有一个线程不停地检查broker中是否有消息，有的话，会主动将请求线程唤醒，然后消费者拿到消息



### pull



### 保证消息不丢失



消息如果发送到消费者了，但是可能消费者还没有真正消费消息，就宕机了，此时消息在系统缓存中，但是却返回给mq的消息是消费者消费消息成功了



同步机制



当消费者真正执行完消息的处理逻辑之后，再将成功的消息返回给mq



不能用异步机制，因为异步机制可能导致消费者还没有消费好消息的时候，已经将成功的消息给mq了



，如果此时消费者宕机了，那么返回给mq的消息就是假的，虽然返回的是储成功的消息，但是实际上并没有成功



## 生产者



### 同步发送消息



发送消息给mq，等待mq返回结果，没有返回结果的话，就会卡在这里



### 异步发送消息



发送消息给mq，不等待mq返回结果，cpu去干别的事儿了，等到mq返回消息后，代码会继续执行下去



### 单向发送消息



发送消息给mq就可以了，不管mq是否返回信息



### 保证消息发送成功



- half消息对消费者不可见



  一般一个消息到mq之后会写入对应的topic/messageque/consumerqueue中，但是rocketmq识别到消息为half消息后，会将消息写入rocketmq的内部topic中，所以消费者对于half来说是不可见的







比如你买东西，已经付款到了订单系统，发了一次half发现mq没有返回消息，mq挂了，于是进行资金回退。



如果本地事务失败了，会让订单系统给mq发送一个rollback，表示我这里失败了，无法接受你返回的消息



如果rollback和commit失败了，由于mq里面的消息一直处于half状态，长时间没有回应之后就知道mq出现问题，这个时候需要判断下订单的状态是“已完成”吗 是的话，再次commit请求，不是的话，再次执行rollback请求，



如何执行rollback



将rollback记录写入到op_+topic,标记某个half消息是rollback的了



假设一直没有执行rollback或者commit，mq最多会调用15次接口来判断half消息的状态，如果15次之后还是没有知道half消息的状态，就会自动将消息标记为rollback



### half



每次发送消息之前，就要发送half消息到mq，如果mq正常工作就会返回一个ok给生产者，生产者就可以发送真正的消息了，如果返回的不是ok，就表示mq有问题，此时就会进行消息回滚



上面其实有三个步骤



1. producer发half给mq



2. mq给producer返回信息



3. producer进行下一步处理



上面三步其实都可能出现问题，那么如何保证不出现问题那，请继续往下看



针对以上三个步骤进行下面三个回复



1. 如果producer发送half消息失败，会调用一个本地线程来查看half消息在限定时间内有消息返回，如果没有则就按回滚处理



2. 如果mq给producer返回信息失败，mq会调用一个本地线程来查看half消息在限定时间内有消息返回，如果没有则就按回滚处理



3. 



如何确保half消息发送成功



消息写入到RMQ_SYS_TRANS_HALF_TOPIC



### 技巧



可以将使用阿里的cannal的技术来同步mysql的binlog



一个topic的数据放在多个messagequeue上，实现分布式存储



## 持久化



### broker



broker收到消息后会将所有消息顺序写入到磁盘中，叫做commitlog，会有一个参数来规定commitlog的最大容量，达到最大容量后会自动创建一个新的commitlog来进行写入



磁盘顺序写+os cache写入+os异步刷盘



broker收到消息之后并不是直接写入磁盘的，是将消息写入到系统缓存中，然后系统缓存不定时将消息写入磁盘



异步刷盘会有数据丢失的风险，比如将数据写入到系统缓存之后，系统突然宕机了，生产者以为将消息已经写入了，但是实际上并没有写入到磁盘中



同步刷盘的意思就是每次必须将数据写入到磁盘中以后才叫做消息发送完成



#### 优化



文件预热



madvise系统调用，会尽可能能将数据从磁盘空间加载到内存中，减少数据从磁盘空间加载到内存的次数



#### mmap



普通的将数据存储在磁盘的过程如下



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e26fed33a45e4042a7398c58c0900fe0~tplv-k3u1fbpfcp-watermark.image)

需要进行两次拷贝



mmap只需要进行一次拷贝



原因：就是把磁盘文件地址和线程私有空间做了一个映射，一旦写入到虚拟内存后，直接拷贝到磁盘空间中即可，不用二次拷贝了（即拷贝到线程私有空间，再拷贝到磁盘空间中）

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0daa0696115344faa5326681596266c1~tplv-k3u1fbpfcp-watermark.image)

### messagequeue



一个topic下面有多个messagequeeu，一个messagequeeu下只有一个consumerqueue



messagequeue在broker的存储上是这样的



会存储在相应topic/messagequeeu0/consumerqueue0



每次broker收到消息之后，会将消息顺序写入磁盘，同时也会将这个消息的物理存储位置记录在topic/messagequeeu0/consumerqueue0中，这样方便消费者过来消费消息的时候，可以知道消息存放的位置



## Dledger



### what



这个机制可以保证当leader broker失效的时候，可以自动切换到slave broker，



### why



采用的是raft算法，简单来讲就是 所有的broker每个人都会投票给自己，第一轮所有人都会投票给自己，然后进行随机休眠，比如broker1休眠2秒，broker2休眠3秒，broker3休眠4秒，从数据来看肯定是broker1先苏醒，他投票给自己，将自己的投票发给其他人，剩下两个发现别人已经投票过了，于是跟随投票，所以broker就被选举上了，成为了leader broker



投票完成：机器数量/2+1，就表示大多数，就是说当有大多数人投票以后，不需要其他人发表意见，直接将大多人的意见作为最后的意见



broker投票机制



1. 有人已经投票的话，会尊重他们的意见，跟随投票



2. 会给自己投票



上面的顺序也是优先级的顺序



### 多副本同步



分为两个阶段



1. uncommitted阶段



2. committed阶段



#### uncommitted阶段



leader broker收到数据后，会标记为uncommitted状态，然后通过他自己的dledger server组件把这个数据发送给slave broker的dledger server



#### committed阶段



slave broker的dledger server收到消息之后，会回复一个ack给leader broker的dledger server，当leader broker收到一半以上的slave broker之后，会将数据标记为committed的状态



然后leader broker的slave broker将committed的状态发送给slave broker的dledger server消息同步完成



## 网络通信架构模型

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90cdb1095d54408f99941399d156c68e~tplv-k3u1fbpfcp-watermark.image)

rocketmq的网络通信架构模型。首先生产者和服务端通过reactor主线程建立tcp长连接，客户端与服务端采用socketchannel进行通信，通过socketschannel发送消息，通过reactor线程池去监听socketchannel的消息到达。reactor线程池只负责把消息取出来，在消息被正式处理前需要加密验证，编码解码，网络连接管理通过worker线程池去做这些准备工作。再通过sendmessage线程池去发送消息。reactor主线程负责建立长连接reactor多线程并发监听消息请求达到。再通过worker多线程去处理消息，读写磁盘通过业务线程池处理，各个线程池执行时，不会影响其他线程池在其他环节处理请求。 reactor线程池采用aio多路复用



## 消息丢失



三种情况



1. 生产者发送消息的时候，由于网络故障或者master broker宕机导致broker没有收到消息，可以通过重试机制和备忘录机制多次发送失败后进行消息补偿



2. 消息到达mq,rocketmq丢消息,当使用异步刷盘时可能消息对于的commit log还在page cache中未刷新到磁盘此时broker的物理机宕机了重启导致page cache中数据丢失,如果选择了同步刷盘消息存储到磁盘后也可能存在丢失当磁盘故障时,此时我们可以通过冗余备份磁盘的方式保证尽量丢少的消息



3. 消息保存到mq,消费者消费消息时未进行ack让mq以为消息消费成功了跳到了下一个offset此时通过ack机制来保证消息不丢失
