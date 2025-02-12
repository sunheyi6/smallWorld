---
title: 一致性hash
description: 
tags:
  - 无标签
pubDate: 2021-05-03
---


文章摘要



介绍一致性hash的来源和实现



<!-- more -->



### 来源



为什么会出现这个东西那？



主要是有了将数据均匀的分散到各个节点中，并且尽量的在加减节点时能使受影响的数据最少的这个需求，传统的hash满足不了，所以出现这个东西



### 实现



#### 范围



首先是将所有的哈希值构成了一个环，其范围在 `0 ~ 2^32-1`，然后各个节点分布在这个环上



![image-20210503210812429](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210503210812429.png)



#### 容错性



![image-20210503210949748](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210503210949748.png)



比如在n1服务器宕机的时候，依然根据顺时针方向，k2 和 k3 保持不变，只有 k1 被重新映射到了 N3。这样就很好的保证了容错性，当一个节点宕机时只会影响到少少部分的数据。



#### 拓展性



![image-20210503211012751](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210503211012751.png)



在 N2 和 N3 之间新增了一个节点 N4 ，这时会发现受印象的数据只有 k3，其余数据也是保持不变，所以这样也很好的保证了拓展性。



#### 虚拟节点



出现这个东西的原因是因为，当服务器数量比较少的时候，会出现数据分布不均匀的情况



于是引入了虚拟节点



虚拟节点的意思其实就是一个key进行多次hash，得到的值，都在hash环上，但是这几个都是虚拟的机器，实际上还是存储在实际的机器上



> 参考文章：

>

> - https://crossoverjie.top/2018/01/08/Consistent-Hash/

> - https://blog.csdn.net/suifeng629/article/details/81567777