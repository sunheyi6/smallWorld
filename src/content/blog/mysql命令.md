---
title: mysql命令
description: ""
tags:
  - 无标签
pubDate: 2021-04-18
---


# sql语句



<!-- more -->



## database



```SQL

#显示所有数据库

show databases;

#切换数据库

use 数据库名;

#DDL 数据定义语言，DDL语言是隐性提交的，不能rollback

create

#DML 数据操纵语言

insert update delete

```



## select



```SQL

select 字段 from 表名

select * from 表名    #查询所有

docker exec -it mysql bash     #进入到docker的mysql中

```



## delete



```SQL

DELETE FROM 表名称 WHERE 列名称 = 值

```



## 删除



### delete



```SQL

update tableName set key1=value1,key2=value2 where 

```



> delete不建议在生产上删除大规模数据，因为这会导致数据库性能下降。

>

> 原因是 使用delete删除数据会形成一个大事务，非常影响数据库的服务

>

> 如果使用delete误删除数据了，可以通过Flashback工具来进行恢复

>

> Flashback 恢复数据的原理，是修改 binlog 的内容，拿回原库重放。而能够使用这个方案的前提是，需要确保 binlog_format=row 和 binlog_row_image=FULL。

>

> 事前保证：

>

> 1. 把 sql_safe_updates 参数设置为 on。这样一来，如果我们忘记在 delete 或者 update 语句中写 where 条件，或者 where 条件里面没有包含索引字段的话，这条语句的执行就会报错

> 2. 代码上线前，必须经过 SQL 审计。



## add



## drop



```sql

drop table 表名字

```







## index



```text

#显示一个表的所有索引

show index from 表名;

```



## order by



排序，默认是升序排列，想要降序的话使用desc



where order by limit执行顺序：先where 然后order by 最后limit



## show



```SQL

#可以列出MySQL服务器运行各种状态值，另外，查询MySQL服务器配置信息语句：

show global status;

#

show variables like ‘%slow%‘；

show global status like ‘%slow%‘;

#查看当前正在执行的语句

show processlist;

#查看表的统计信息

#rows是个估计值，data_length是表的聚簇索引的字节大小

show table status like “表名”; 

 #查看从库状态

 show slave status；

 里面有个seconds_behind_master 意思是从库和主库的延迟是多少秒

```



## join



### inner join



普通的联表查询就是内连接，就是两个表的交集



### outer join



一般连接条件放在on里面



```SQL

select 

e.name,e.department,ps.product_name,ps.saled_amount

from employee e left out join product_saled pa

on e.id=pa.employee_id 

```



#### nest-loop join



嵌套循环关联



#### 左外连接



如果左表的数据在右表里没有任何匹配的也要全部返回



#### 右外连接



如果右表的数据在左表里没有任何匹配的也要全部返回



## limit



主要作用就是限制回表到聚簇索引的次数，比如你select * from student ，会进行全表扫描，加个limit就会减少从联合索引查询的数据，然后再从主键索引中查找，性能会好一些



```SQL

#查询的是从6-15行

limit 5,10

```