---
title: redis命令
description: 
tags:
  - 无标签
pubDate: 2021-03-27
---


### 基础命令



<!-- more -->



```bash

# nx 都是在key不存在的时候进行设置，通过这个可以实现最简单的分布式锁

set key  value nx

#统计字符串数量

strlen

#取字符串的一个片段

getrange 开始 结尾

#默认每次给一个key增加1，也可以设置增加的数值

#博客点赞次数

incr

#默认给key减一

decr

```



审计日志



可以用到append命令，key为当前日期，value为今天对机器的所有操作



网址的长链接转短链接



```java

转换为对象集合的，可以使用 fastjson的 json.parseArray().tostring,数据

```






