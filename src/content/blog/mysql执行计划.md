---
title: mysql执行计划
description: 
tags:
  - 无标签
pubDate: 2021-04-04
---


## Explain



<!-- more -->



### 模样



![image-20210404081229369](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210404081229369.png)



### 使用



```sql

explain select * from user

```



### possible_keys



所有的可能使用的索引



### key



实际使用的索引



### select_type



simply  单表或者多表连接查询



primary  主查询



subquery 子查询



union_result  根据union去重



depend subquery  内层的子查询



depend union   内层的union



derived  根据临时表执行的查询



materialized  物化为临时表，就是生成一个临时表存储到磁盘上



### id



一个select对应一个id，如果是多个select就会对应多个id



### keys_len



索引的长度



### extra



#### using index



直接在二级索引中查到结果，不需要回表



#### using index condition



![image-20210404081452807](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210404081452807.png)



#### using where



1. 没有用到索引

2. 除了用到了索引，还用到了其他没有索引的字段



#### using firesort



没有用到索引，会基于内存或者磁盘进行排序，大部分情况下都是基于内存进行排序的，性能非常差



#### using temporary



使用了临时表进行操作



#### using join buffer



内存优化的手段，减少表的全表扫描次数



### filtered



经过搜索之后剩余数据的百分比,也就是你想要的结果



### rows



预估读取的行数



### type



#### const



直接通过主键索引或者唯一二级索引列进行等值匹配的时候可以查找到数据，type就是const



但是这个二级索引必须是唯一的，如果只是二级索引不是唯一索引，type就是ref



#### ref



1. 如果是普通索引进行等值比较，就是ref

2. 执行连接查询，被驱动表中的某个普通二级索引列与驱动表中的某个列进行等值匹配，那么对被驱动表也可能是使用ref的访问方法



#### eq_ref



执行连接查询的时候，如果被驱动表是通过主键或不允许存储null值的唯一二级索引列等值匹配的方式进行访问的（如果该主键或者不允许存储null的唯一二级索引是联合索引，则所有的索引都必须进行等值比较），则对该驱动表的访问方式是eq_ref



#### ref_or_null



如果是多个普通索引，连续多个都是等值比较且索引列的值可以null值的时候，访问方法可能是ref_or_null



> 不是某个列的值为null，而是在sql语句中专门加上is null 这种情况



#### fulltext



全文索引



#### index_merge



一般情况下只会为单个索引生成扫描区间，但是我们在唠叨单标访问方式的时候，特意强调了在某些场景下也可以使用Intersection union sort-union这三种索引列合并的方式来执行查询



#### unique_subquery



类似于两表连接的eq_ref访问方法，unique_subquery针对的是一些包含in子查询的查询语句。如果查询优化器决定将in子查询转换为exists子查询，而且子查询在转换之后可以使用爪机或者不允许存储null值的唯一二级索引进行等值匹配，那么该子查询的type列的值就是unique_subquery



#### index_subquery



和unique_subquery类似，只不过在访问子查询中的表时使用的是普通索引



#### range



一旦使用了二级索引作为范围查找，就是range



#### index



1. 只要遍历二级索引就可以拿到想要的数据，不需要进行回表的，就是index



   >比如 select x，y，z from user where x2=xxx（联合索引字段为x，y，z），这个时候发现，x，y，z都是联合索引的字段，所以直接根据联合索引的索引树，将数据取出来即可，这个比遍历主键索引块多了，毕竟二级索引的叶子节点数据比主键索引的叶子节点少的多



2. 对于innodb存储引擎来说，当我们需要执行全表扫描，并且需要对主键进行排序的时候，此时访问方法就是index



#### all



全表扫描



### ref



#### const



使用了你在sql语句中的值进行等值匹配



#### table_db.t1.id



```sql

select * from t1 inner join t2 on t1.id=t2.id

```



这样的情况，type列一般为eq_ref



## show wanging



执行完执行计划，可以执行这个语句，如果看到semi join可能这就是sql之索引慢的原因了



> mysql在生成执行计划的时候，会自动的把一个普通的in语句，优化成了in+子查询