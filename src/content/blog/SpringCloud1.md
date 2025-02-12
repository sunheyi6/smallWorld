---
title: SpringCloud1
description: 
tags:
  - 无标签
pubDate: 2021-05-20
---


文章摘要



<!-- more -->



SpringCloudNetFlix



# 核心问题



微服务架构核心问题



1. 服务很多，客户端如何访问

2. 这么多服务，服务之间如何通信

3. 如何治理服务

4. 服务挂了怎么办



解决方案



Spring Cloud 生态



1. Spring Cloud  NetFlix   一站式解决方案！



- api网关：zuul组件

- 服务调用 Feign--HttpClinet   http通信方式。同步 阻塞

- 服务注册发现 Eureka

- 熔断机制 Hystrix

- 负载均衡 ribbon



1. Apache Dubbo Zookeeper  半自动，需要整合别人的



- api：没有，用第三方插件，或者自己实现

- Dubbo

- Zookeeper

- 没有，借助 Hystrix



1. Spring Cloud Alibaba   最新的 一站式解决方案  更简单



# 认识Spring Cloud



springboot专注于快速、方便的开发单个个体微服务，springCloud关注全局协调的微服务框架



现在大型网站的架构图



![image-20210520103022522](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103022522.png)



# Spring Cloud  NetFlix



## Eureka



服务注册和服务发现



必须要进行参数优化，否则速度太慢



nacos zookeeper rockemq中的nameserver也是这个作用



consul



![image-20210520103056022](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103056022.png)



为什么要搞两级缓存



目的就是为了避免并发冲突



### 集群模式



![image-20210520103108643](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103108643.png)



## Eureka优化



![image-20210520103206520](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103206520.png)



## Eureka和Zookeeper区别



CAP理论：



- C 一致性

- A 可用性

- P 容错性



由于分区容错P在分布式系统中是必须要保证的，因此，偶问你只能在A和P之间进行权衡



- Zookeeper保证的是CP

- Eureka保证的是AP



## Feign



服务调用



整合eureka和ribbon



Feign是面向接口的



## Ribbon



负载均衡



服务第一次被调用的时候，他会初始话一个ribbon组件，初始化这些组件可能会耗费一定时间，所以很容易导致服务超时。开启下面参数，让每个服务启动的时候就直接初始化ribbon相关的组件，避免第一次请求的时候初始化



![image-20210520103340803](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103340803.png)



## Hystrix



服务熔断在服务端



服务降级在客户端



> 服务熔断



1. 定义：某个服务超时或者异常，引起熔断   类似于保险丝的作用

2. 一般发生在服务端



> 服务降级



1. 定义：从整体网站请求负载考虑，当前某些服务访问量比较大，会暂时关闭一些访问量比较小的服务，将整个网站的资源倾斜在访问量比较大的服务上，等到访问量下来，就重新开启那些服务；此时在客户端上，我们可以准备一个FallbackFactory，返回默认的值，提示用户当前的服务不可用

2. 一般发生在客户端



## Zuul



路由网关，用户一进来接触的组件就是路由网关



![image-20210520103304727](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103304727.png)



主要功能：



- 路由

- 过滤



zuul服务最终还是会注册到Eureka中



# zookeeper



![image-20210520103250856](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210520103250856.png)



# 网关



## 核心功能



1. 动态路由

2. 灰度发布

3. 授权认证

4. 性能监控

5. 系统日志

6. 数据缓存

7. 限流熔断



kong zuul ngnix+lua（openresty） 自研网关



大厂基本上都是基于netty做的自有网关



zuul：基于java开发，功能比较简单，但是比如灰度发布，限流，动态路由等没有这些功能



kong：依托于ngnix实现，openresty，lua实现的模块，现成的一些插件，可以直接使用



## zuul



一般来讲一台8核16g的zuul每秒抗1000+不成问题