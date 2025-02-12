---
title: redis之String
description: 
tags:
  - 无标签
pubDate: 2021-05-09
---


详细介绍redis String类型



<!-- more -->



# what



String是redis的基本类型之一



```Bash

set name shy     #设置name为shy的键值对

get name    #获取键为name的值

keys *    #查看所有键值对

exits key名字 #返回1，表示key存在，0表示不存在

move key名字 1  #1表示当前数据库，删除key

expire key名字 10  #设置key名字的过期时间为10秒

ttl key名字 #查看key名字的过期时间还剩多少秒

type key名字 #key的类型

append key名字 值 #向key的值追加数据

strlen key名字 #获取key的长度

incr key  #给key+1

decr key   #给key-1

incrby key 步长  #key每次加多少

decrby  key 步长# key每次减多少

getrange key 0 3  #截取字符串从0到3

getrange key 0 -1  #查看所有内容

setrange key 1 xx   #将第1位的值替换为xx

setex（set with expire）  #设置过期时间

setex key3 30 “hello” #设置key3的值为hello，30秒后会过期

setnx（set if not exist）  #不存在设置

setnx key3 “redis”  #如果不存在key3，就创建

mset key value  #一次设置多个键值对

mget key1 key2  #一次获取多个键的值

msetnx 多键值对版本 #是一个原子性的操作，要么都成功，要么都失败 

mset user:1:name zhangsan  user:1:age 12

#设置一个对象的两个属性 对象名：ID：属性名

mget user：1：name user：1：age

#获取一个对象的两个属性

setget v1 redis

#如果不存在v1，则返回空，但是将v1的值设置为redis

#，如果存在，则返回v1的值，然后将v1的设置为redis

```



# why



## SDS



采用sds结构来存储字符串，结果如下



![](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210509073428239.png)redis中使用这样的sds的结构来构建字符串主要有以下几个原因：



1. 当获取长度的时候，时间复杂度为0（1）

2. 二进制安全，当比如用一个空字符串作为字符串中的一个特殊变量的时候，由于c中的字符串是通过\0这个空字符来区分一个字符串是否结尾的，所以它只能用于保存文本数据，而不能保存像图片、音频、视频、压缩文件这样的二进制数据

3. 杜绝缓冲区溢出（sds是通过预分配策略和惰性空间释放来减少的）

4. 减少修改字符串时带来的内存重分配次数（sds是通过预分配策略和惰性空间释放来减少的）

5. 可以使用c语言的一些函数，因为sds字符串的也是以\0 作为结尾的，但是sds字符串是通过sds的len属性来确定这个字符串是不是结束的，c的字符串则是单一的通过\0来确认一个字符串是否结束



### 预分配策略



如果对SDS进行修改之后，SDS的长度（也即是len属性的值）将小于1MB，那么程序分配和len属性同样大小的未使用空间，这时SDS len属性的值将和free属性的值相同。举个例子，如果进行修改之后，SDS的len将变成13字节，那么程序也会分配13字节的未使用空间，SDS的buf数组的实际长度将变成13+13+1=27字节（额外的一字节用于保存空字符）。



如果对SDS进行修改之后，SDS的长度将大于等于1MB，那么程序会分配1MB的未使用空间。举个例子，如果进行修改之后，SDS的len将变成30MB，那么程序会分配1MB的未使用空间，SDS的buf数组的实际长度将为30MB+1MB+1byte。



### 惰性空间释放



惰性空间释放用于优化SDS的字符串缩短操作：当SDS的API需要缩短SDS保存的字符串时，程序并不立即使用内存重分配来回收缩短后多出来的字节，而是使用free属性将这些字节的数量记录起来，并等待将来使用。



### sds和c字符串的区别



![image-20210509073428239](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210509073428239.png)