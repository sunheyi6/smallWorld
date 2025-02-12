---
title: volatile
description: ""
tags:
  - 无标签
pubDate: 2021-03-27
---


三大特性：保证可见性，不保证原子性，禁止指令重排



<!-- more -->



### 不保证原子性测试



```java

public class demo2 {

    private volatile static  int num=0;

    public  static  void add(){

        num++;

    }

    public static void main(String[] args) {

        for (int i = 0; i < 100; i++) {

            new Thread(()->{

                for (int j = 0; j <1000 ; j++) {

                    add();

                }

            }).start();

        }



        while (Thread.activeCount()>2)

        {

            Thread.yield();

        }

        System.out.println(Thread.currentThread().getName()+"---"+num);

    }

}

```



### 不加lock和synchronized如何保证原子性



使用原子类



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16908aea3345438e8f5821e293403ab7~tplv-k3u1fbpfcp-watermark.image)



代码示例



```java

public class demo2 {

    private  static AtomicInteger num=new AtomicInteger();

    public  static  void add(){

        num.getAndIncrement();

    }

    public static void main(String[] args) {

        for (int i = 0; i < 100; i++) {

            new Thread(()->{

                for (int j = 0; j <1000 ; j++) {

                    add();

                }

            }).start();

        }

        while (Thread.activeCount()>2)

        {

            Thread.yield();

        }

        System.out.println(Thread.currentThread().getName()+"---"+num);

    }

}

```



这些类的底层都和操作系统挂钩！在内存中修改值！unsafe类是一个很特殊的存在！



### 指令重排



#### 什么是指令重排



指令重排：你写的程序，并不是按照你写的那样去执行的



> 处理器在进行指令重排的时候，考虑：数据之间的依赖性



源代码到代码执行的过程



源代码->编译器优化重排->指令也可能重排->内部系统也会重排



> 指令重排原理



内存屏障，Cpu指令、作用：



1. 保证特定的操作的执行顺序！

2. 可以保证某些变量的内存可见性（利用这些特性volatile实现了可见性）



### 可见性



#### 作用



下面会涉及几个CPU的术语



- 内存屏障：用于实现用户操作排列顺序的CPU指令

- 缓冲行：缓存的最小单位



有volatile变量修饰的共享变量进行写操作的时候会多出第二行汇编代码，通过查IA-32架构软件开发者手册可知，Lock前缀的指令在多核处理器下会引发了两件事。



1. 将当前处理器缓存行的数据写回到系统内存

2. 这个写回内存的操作会使在其他CPU里缓存了该内存地址的数据无效



其实很简单，各个线程会有一个**共享的主内存**，读取数据都要从主内存读取，每个线程都有自己的内存，线程读取数据的时候就是把主内存的数据读取到线程私有的内存里面，当线程修改自己内存中的变量之后，会将修改的值更新到主内存中，此时其他线程私有内存中所保留的值全部失效，必须重新从主内存读取该变量 



> volatile中使用的是地址的引用，而非值的复制，因为如果是值的复制的话，当volatile中所修饰的值变得非常大之后，复制也是非常耗时的，可能就无法保证及时将修改后的数据及时协会到内存中



线程



> JMM是个虚拟概念，在实际中其实就是放在cache中

>

> 

>

> 那其他线程是如何知道自己缓存的数据有变化了那？

>

> 这是通过硬件（处理器的嗅探机制）来实现的，不难猜出，所谓的嗅探机制就是当共享内存的变量被修改的时候，所有缓存该变量的线程中的值都将失效，必须要重新从共享内存读取才行



### volatile优化



缓存行数据为64字节，但是如果结点的数据不足64字节的话，自动填充到64字节可以提升效率



不能使用volatile变量是都应该追加到64字节吗？两种情况不允许



- 缓存行非64字节宽的处理器

- 共享变量不会被频繁的写