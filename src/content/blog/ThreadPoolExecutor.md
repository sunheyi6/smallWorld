---
title: ThreadPoolExecutor
description: 
tags:
  - 无标签
pubDate: 2021-05-22
---


从源码层面来详细了解



<!-- more -->



## why



为什么要使用线程池？



线程过多会带来额外的开销，其中包括创建销毁线程的开销、调度线程的开销等等，同时也降低了计算机的整体性能。线程池维护多个线程，等待监督管理者分配可并发执行的任务。这种做法，一方面避免了处理任务时创建销毁线程开销的代价，另一方面避免了线程数量膨胀导致的过分调度问题，保证了对内核的充分利用。



## what



```java

//ctl就是把线程的运行状态和工作线程数进行统一管理的

//AtomicInteger这个类可以通过CAS达到无锁并发，效率比较高,这个变量有双重身份，它的高三位表示线程池的状态，低29位表示线程池中现有的线程数，这也是Doug Lea一个天才的设计，用最少的变量来减少锁竞争，提高并发效率。

private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

///表示线程池线程数的bit数

private static final int COUNT_BITS = Integer.SIZE - 3;

//最大的线程数量，数量是完全够用了

private static final int CAPACITY   = (1 << COUNT_BITS) - 1;



// runState is stored in the high-order bits

private static final int RUNNING    = -1 << COUNT_BITS;

private static final int SHUTDOWN   =  0 << COUNT_BITS;

private static final int STOP       =  1 << COUNT_BITS;

private static final int TIDYING    =  2 << COUNT_BITS;

private static final int TERMINATED =  3 << COUNT_BITS;



// Packing and unpacking ctl

//获取线程池的状态

private static int runStateOf(int c)     { return c & ~CAPACITY; }

//获取线程的数量

private static int workerCountOf(int c)  { return c & CAPACITY; }

private static int ctlOf(int rs, int wc) { return rs | wc; }

    /*

     * Bit field accessors that don't require unpacking ctl.

     * These depend on the bit layout and on workerCount being never negative.

     */



    private static boolean runStateLessThan(int c, int s) {

        return c < s;

    }



    private static boolean runStateAtLeast(int c, int s) {

        return c >= s;

    }



    private static boolean isRunning(int c) {

        return c < SHUTDOWN;

    }

```



### 状态



- RUNNING, 运行状态，值也是最小的，刚创建的线程池就是此状态，能接受新提交的任务，并且也能处理阻塞队列中的任务

- SHUTDOWN，关闭状态，不再接受新提交的任务，但却可以继续处理阻塞队列中已保存的任务。在线程池处于 RUNNING 状态时，调用 shutdown()方法会使线程池进入到该状态。（finalize() 方法在执行过程中也会调用shutdown()方法进入该状态）

- STOP，不能接受新任务，也不处理队列中的任务，会中断正在处理任务的线程。在线程池处于 RUNNING 或 SHUTDOWN 状态时，调用 shutdownNow() 方法会使线程池进入到该状态；

- TIDYING，如果所有的任务都已终止了，workerCount (有效线程数) 为0，线程池进入该状态后会调用 terminated() 方法进入TERMINATED 状态。

- TERMINATED，在terminated() 方法执行完后进入该状态，默认terminated()方法中什么也没有做。



![image-20210523080302512](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210523080302512.png)



### 构造方法



```java

public ThreadPoolExecutor(int corePoolSize,

                          int maximumPoolSize,

                          long keepAliveTime,

                          TimeUnit unit,

                          BlockingQueue<Runnable> workQueue) {

    this(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue,

         Executors.defaultThreadFactory(), defaultHandler);

}

```



- **corePoolSize**：核心线程数量，当有新任务在execute()方法提交时，会执行以下判断：



  1. 如果运行的线程少于 corePoolSize，则创建新线程来处理任务，即使线程池中的其他线程是空闲的；

  2. 如果线程池中的线程数量大于等于 corePoolSize 且小于 maximumPoolSize，则只有当workQueue满时才创建新的线程去处理任务；

  3. 如果设置的corePoolSize 和 maximumPoolSize相同，则创建的线程池的大小是固定的，这时如果有新任务提交，若workQueue未满，则将请求放入workQueue中，等待有空闲的线程去从workQueue中取任务并处理；

  4. 如果运行的线程数量大于等于maximumPoolSize，这时如果workQueue已经满了，则通过handler所指定的策略来处理任务；



  所以，任务提交时，判断的顺序为 corePoolSize –> workQueue –> maximumPoolSize。



- **maximumPoolSize**：最大线程数量；



- **workQueue**：等待队列，当任务提交时，如果线程池中的线程数量大于等于corePoolSize的时候，把该任务封装成一个Worker对象放入等待队列；



- workQueue



  ：保存等待执行的任务的阻塞队列，当提交一个新的任务到线程池以后, 线程池会根据当前线程池中正在运行着的线程的数量来决定对该任务的处理方式，主要有以下几种处理方式:



  1. **直接切换**：这种方式常用的队列是SynchronousQueue，但现在还没有研究过该队列，这里暂时还没法介绍；



  2. **使用无界队列**：一般使用基于链表的阻塞队列LinkedBlockingQueue。如果使用这种方式，那么线程池中能够创建的最大线程数就是corePoolSize，而maximumPoolSize就不会起作用了（后面也会说到）。当线程池中所有的核心线程都是RUNNING状态时，这时一个新的任务提交就会放入等待队列中。



  3. 使用有界队列



     ：一般使用ArrayBlockingQueue。使用该方式可以将线程池的最大线程数量限制为maximumPoolSize，这样能够降低资源的消耗，但同时这种方式也使得线程池对线程的调度变得更困难，因为线程池和队列的容量都是有限的值，所以要想使线程池处理任务的吞吐率达到一个相对合理的范围，又想使线程调度相对简单，并且还要尽可能的降低线程池对资源的消耗，就需要合理的设置这两个数量。



     - 如果要想降低系统资源的消耗（包括CPU的使用率，操作系统资源的消耗，上下文环境切换的开销等）, 可以设置较大的队列容量和较小的线程池容量, 但这样也会降低线程处理任务的吞吐量。

     - 如果提交的任务经常发生阻塞，那么可以考虑通过调用 setMaximumPoolSize() 方法来重新设定线程池的容量。

     - 如果队列的容量设置的较小，通常需要将线程池的容量设置大一点，这样CPU的使用率会相对的高一些。但如果线程池的容量设置的过大，则在提交的任务数量太多的情况下，并发量会增加，那么线程之间的调度就是一个要考虑的问题，因为这样反而有可能降低处理任务的吞吐量。



- **keepAliveTime**：线程池维护线程所允许的空闲时间。当线程池中的线程数量大于corePoolSize的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等待，直到等待的时间超过了keepAliveTime；



- **threadFactory**：它是ThreadFactory类型的变量，用来创建新线程。默认使用Executors.defaultThreadFactory() 来创建线程。使用默认的ThreadFactory来创建线程时，会使新创建的线程具有相同的NORM_PRIORITY优先级并且是非守护线程，同时也设置了线程的名称。



- handler



  ：它是RejectedExecutionHandler类型的变量，表示线程池的饱和策略。如果阻塞队列满了并且没有空闲的线程，这时如果继续提交任务，就需要采取一种策略处理该任务。线程池提供了4种策略：



  1. AbortPolicy：直接抛出异常，这是默认策略；

  2. CallerRunsPolicy：用调用者所在的线程来执行任务；

  3. DiscardOldestPolicy：丢弃阻塞队列中靠最前的任务，并执行当前任务；

  4. DiscardPolicy：直接丢弃任务；



```java

//上面的this调用的就是这个方法，这个方法中会进行一些异常情况的判断

public ThreadPoolExecutor(int corePoolSize,

                          int maximumPoolSize,

                          long keepAliveTime,

                          TimeUnit unit,

                          BlockingQueue<Runnable> workQueue,

                          ThreadFactory threadFactory,

                          RejectedExecutionHandler handler) {

    if (corePoolSize < 0 ||

        maximumPoolSize <= 0 ||

        maximumPoolSize < corePoolSize ||

        keepAliveTime < 0)

        throw new IllegalArgumentException();

    if (workQueue == null || threadFactory == null || handler == null)

        throw new NullPointerException();

    this.acc = System.getSecurityManager() == null ?

            null :

            AccessController.getContext();

    this.corePoolSize = corePoolSize;

    this.maximumPoolSize = maximumPoolSize;

    this.workQueue = workQueue;

    this.keepAliveTime = unit.toNanos(keepAliveTime);

    this.threadFactory = threadFactory;

    this.handler = handler;

}

```



### execute方法



```java

public void execute(Runnable command) {

    if (command == null)

        throw new NullPointerException();

    //ctl的低29位表示线程数，高三位表示线程的状态

    int c = ctl.get();

    //如果正在工作的线程数小于核心线程数，就需要增加一个线程

    if (workerCountOf(c) < corePoolSize) {

        if (addWorker(command, true))

            return;

        //如果增加线程失败，就会重新获取ctl

        c = ctl.get();

    }

    

    if (isRunning(c) && workQueue.offer(command)) {

        int recheck = ctl.get();

        if (! isRunning(recheck) && remove(command))

            reject(command);

        else if (workerCountOf(recheck) == 0)

            addWorker(null, false);

    }

    else if (!addWorker(command, false))

        reject(command);

}

```











## 参考文章



- https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html

- http://www.ideabuffer.cn/2017/04/04/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3Java%E7%BA%BF%E7%A8%8B%E6%B1%A0%EF%BC%9AThreadPoolExecutor/****