---
title: oracle表空间
description: ""
tags:
  - 无标签
pubDate: 2021-06-12
---


详细介绍表空间



<!-- more -->



在逻辑结构中，Oracle从大到下，分别是如下的结构：**数据库实例 -> 表空间 -> 数据段（表） -> 区 -> 块。**



也就是说当我们要使用Oracle作为项目的数据库时，我们需要先创建数据库实例，之后创建表空间，再创建相对应的表（也就是逻辑结构中的数据段）。



使用Oracle作为项目的数据库时，我们需要先创建数据库实例，之后创建表空间，再创建相对应的表（也就是逻辑结构中的数据段）。



## 常营命令



```sql

# 给表空间增加大小

alter tablespace HGCS1031 

add datafile 'C:\APP\YSS\PRODUCT\11.2.0\DBHOME_1\DATABASE\HGCS1031_1.DBF'

Size 1000M Autoextend on maxsize unlimited; 

#查看表空间大小

select tablespace_name,sum(bytes)/1024/1024 from dba_data_files group by tablespace_name;

# 查看表空间大小已经使用的情况和分配情况

select SEGMENT_TYPE,owner,sum(bytes)/1024/1024 from  dba_segments  where tablespace_name='XITONG' group by segment_type,owner;

 # 查看block的大小

 select value/1024 as "kb" from v$parameter where name='db_block_size'; 

```



由于Oracle的Rowid使用22位来代表数据块号，因此Oracle表空间数据文件每个数据文件最多只能包含2^22个数据块。



也因此数据库表空间的数据文件不是无限增长的，例如：



在数据块为8k的情况下，单个数据文件的最大容量为8K*2^22 = 32G



2K = 8G、8K = 32G、16K = 64G、32K = 128G；



DB_BLOCK_SIZE作为数据库的最小操作单位，是在创建数据库的时候指定的，在创建完数据库之后便不可修改。要修改DB_BLOCK_SIZE，需要重建数据库。一般可以将数据EXP出来，然后重建数据库，指定新的DB_BLOCK_SIZE，然后再将数据IMP进数据库。



## 空间不足



首先选择设置自增长，sql语句：Alter tablespace 表空间名 adddatafile ‘数据文件存放路径‘ autoextend on next 每次增加的大小 maxsize 数据文件大小的最大值



## 增加数据文件



在自增长失灵了之后，需要增加数据文件，sql语句：Alter tablespace 表空间名 adddatafile ‘数据文件存放的路径’ size 数据文件大小M autoextend on next 每次自增长大小M Maxsize UNLIMITED；（后半部分为设置自增长）



这里放个例子：



```sql

alter tablespace SDE add datafile 'E:\app\EmmaXu\product\11.1.0\db_1\database\SDE_1.dbf' size 400Mautoextend off

```


