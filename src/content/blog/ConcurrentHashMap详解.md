---
title: ConcurrentHashMap详解
description: ""
tags:
  - 无标签
pubDate: 2022-11-06
---


ConcurrentHashMap详解



<!-- more -->



# 前言

作为java面试当中非常典型的问题，刚毕业的时候就看了不少相关八股文，今天还是再来回顾一下吧。



# what



ConcurrentHashMap 是 JUC 包提供的线程安全集合类， Concurrent 类型的容器有以下特点：



- 内部很多操作采用 CAS 机制，一般可以提供较高的吞吐量

- 弱一致性：

	- 遍历时弱一致性，例如，当利用迭代器遍历时，如果容器发生修改，迭代器仍然可以继续进行遍 历，这时内容是旧的

	- 求大小弱一致性，size 操作未必是 100% 准确

	- 读取弱一致性

	ConcurrentHashMap 中不仅仅采用了 CAS 机制，还提供了锁分段的技术来提高并发访问率。



HashTable容器在竞争激烈的并发环境下表现出效率低下的原因是所有访问HashTable的线程都必须竞争同一把锁，假如容器里有多把锁，每一把锁用于锁容器其中一部分数据，那么当多线程访问容器里不同数据段的数据时，线程间就不会存在锁竞争，从而可以有效提高并发访问效率，这就是ConcurrentHashMap所使用的锁分段技术。首先将数据分成一段一段地存储，然后给每一段数据配一把锁，当一个线程占用锁访问其中一个段数据的时候，其他段的数据也能被其他线程访问。



# jdk7



![image-1667735204183](https://shyblog.oss-cn-beijing.aliyuncs.com/img/image-1667735204183.png)



# 参考

- [深入理解ConcurrentHashMap](https://mvbbb.cn/concurrenthashmap-deepunderstanding/)
