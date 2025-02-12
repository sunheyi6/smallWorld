---
title: ThreadLocal
description: 
tags:
  - 无标签
pubDate: 2021-04-28
---


主要是来介绍threadlocal的使用和注意点



<!-- more -->



### 使用场景



在任何一个类里面想用的时候直接拿出来使用



### 基础认识



threadlocal其实主要是使用threadlocalmap来存储数据的，key是线程id，value是对应的值，value值默认为null



### 主要方法



#### set



```java

public void set(T value) {

    Thread t = Thread.currentThread();

    ThreadLocalMap map = getMap(t);

    if (map != null)

        map.set(this, value);

    else

        createMap(t, value);

}

```



#### get



```java

public T get() {

    Thread t = Thread.currentThread();

    ThreadLocalMap map = getMap(t);

    if (map != null) {

        ThreadLocalMap.Entry e = map.getEntry(this);

        if (e != null) {

            @SuppressWarnings("unchecked")

            T result = (T)e.value;

            return result;

        }

    }

    return setInitialValue();

}

```



#### remove



```java

public void remove() {

    ThreadLocalMap m = getMap(Thread.currentThread());

    if (m != null)

        m.remove(this);

}

```



### 总结



![image-20210428105746751](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210428105746751.png)



threadlocal常用的set get remove最终都调用了**expungeStaleEntry**方法，这个方法可以将无用entry(脏数据)回收清理掉



回收垃圾数据的这方式和redis的过期淘汰策略有点像，过期淘汰策略中的**定期删除**所采用的思想与**cleanSomeSlots**如出一辙：都是选取一批而不是全部的Key来进行删除，以此来权衡内存占用与CPU占用之间的关系



### 注意事项



1. 每次使用过threadlocal之后一定要使用remove方法来避免内存泄漏



> 参考文章链接：

>

> 1. https://www.jianshu.com/p/c2cea2285f67

> 2. https://www.jianshu.com/p/9cc71c6a694a

> 3. https://www.jianshu.com/p/f135c24a4114