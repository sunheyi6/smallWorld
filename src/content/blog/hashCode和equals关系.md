---
title: hashCode和equals关系
description: 
tags:
  - 无标签
pubDate: 2021-05-10
---


 详细对比hashCode和equals



<!-- more -->



## **hashCode()和equals()是什么？**



hashCode()方法和equals()方法的作用其实一样，在Java里都是用来对比两个对象是否相等一致。



## hashCode()和equals()区别是什么？



### 性能



就性能来说，肯定是hashcode更快一下，毕竟只需要比较hashcode值就好



equals的话，比如String类型，如果是字符串比较大的话，比较起来就比较慢，如果字符串比较小的话，就比较快



### 可靠性



- equals()相等的两个对象他们的hashCode()肯定相等，也就是用equals()对比是绝对可靠的。

- hashCode()相等的两个对象他们的equals()不一定相等，也就是hashCode()不是绝对可靠的。



## 为何重写equals也要重写hashcode



如果你重写了equals，比如说是基于对象的内容实现的，而保留hashCode的实现不变，那么很可能某两个对象明明是“相等”，而hashCode却不一样。



这样，当你用其中的一个作为键保存到hashMap、hasoTable或hashSet中，再以“相等的”找另一个作为键值去查找他们的时候，则根本找不到。



## **为什么equals()相等，hashCode就一定要相等，而hashCode相等，却不要求equals相等?**



- 因为是按照hashCode来访问小内存块，所以hashCode必须相等。

- HashMap获取一个对象是比较key的hashCode相等和equals为true。



之所以hashCode相等，却可以equal不等，就比如ObjectA和ObjectB他们都有属性name，那么hashCode都以name计算，所以hashCode一样，但是两个对象属于不同类型，所以equals为false。



## 阿里相关约束



- 只要重写 equals，就必须重写 hashCode；

- 因为 Set 存储的是不重复的对象，依据 hashCode 和 equals 进行判断，所以 Set 存储的对象必须重写这两个方法；

- 如果自定义对象做为 Map 的键，那么必须重写 hashCode 和 equals；

- String 重写了 hashCode 和 equals 方法，所以我们可以非常愉快地使用 String 对象作为 key 来使用；



> 参考链接：

>

> https://zhuanlan.zhihu.com/p/58337357