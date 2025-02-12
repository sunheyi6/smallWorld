---
title: sql语句
description: ""
tags:
  - 无标签
pubDate: 2021-04-04
---


### DDL



### 多表



> 尽量让多个表中都有索引，否则查询速度会很慢



#### inner join



```sql

select * from a,b where a.id=b.id

```



要求两个表的数据可以完全关联起来



> 连接可以放在where条件中



#### outer join



> 一般把连接条件放在on的后面



##### left join



左侧的全部数据返回，无论右侧表中是否有



##### right join



连接的全部数据返回，无论左侧表中是否有



### nest-loop join



嵌套循环关联



## 删除






