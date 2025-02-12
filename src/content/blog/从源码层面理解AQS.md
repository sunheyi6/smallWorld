---
title: 从源码层面理解AQS
description: ""
tags:
  - 无标签
pubDate: 2021-07-17
---
了解一下



<!-- more -->



# 基本属性



```java

// 头结点，你直接把它当做 当前持有锁的线程 可能是最好理解的

private transient volatile Node head;



// 阻塞的尾节点，每个新的节点进来，都插入到最后，也就形成了一个链表

private transient volatile Node tail;



// 这个是最重要的，代表当前锁的状态，0代表没有被占用，大于 0 代表有线程持有当前锁

// 这个值可以大于 1，是因为锁可以重入，每次重入都加上 1

private volatile int state;



// 代表当前持有独占锁的线程，举个最重要的使用例子，因为锁可以重入

// reentrantLock.lock()可以嵌套调用多次，所以每次用这个来判断当前线程是否已经拥有了锁

// if (currentThread == getExclusiveOwnerThread()) {state++}

private transient Thread exclusiveOwnerThread; //继承自AbstractOwnableSynchronizer



//

Node nextWaiter;

```

# 常量

```java

//表示节点在共享模式下

static final Node SHARED = new Node();

//表示节点在独占模式下

static final Node EXCLUSIVE = null;



//下面的值是给waitState用的



//代表此线程取消了争抢这个锁

static final int CANCELLED =  1;

//表示当前节点的后继节点需要被唤醒

static final int SIGNAL    = -1;

//waitStatus 值指示线程正在等待条件

static final int CONDITION = -2;

//指示下一个acquireShared 应无条件传播的waitStatus 值

static final int PROPAGATE = -3;

```

# 方法

## predecessor

在node的结构当中有一个有一个有意思的方法

```java

//这个方法就是用来返回当前节点的前缀节点的，如果为空，就抛出异常，如果存在，就返回这个前缀节点

final Node predecessor() throws NullPointerException {

    Node p = prev;

    if (p == null)

        throw new NullPointerException();

    else

        return p;

}

```

## FairSync-lock

### lock

```java

final void lock() {

    acquire(1);

}

```

### acquire

```java



public final void acquire(int arg) {

    if (!tryAcquire(arg) &&

        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))

        selfInterrupt();

}

```

可以清楚看到这个方法就是一个与条件，而想要这个方法成立     

1. 要让tryAcquire返回的是false，而tryAcquire方法返回false的情况是 阻塞队列中有节点，或者cas竞争锁失败，并且当前线程没有锁。

2. 这第二步就可以执行acquireQueued方法了,这个方法首先调用了addWaiter方法，addWaiter方法主要是就是将这个node加入阻塞队列当中，不过其中有个判断，就是如果队列不为空的话，就直接加入队列返回node，如果是为空的话，就初始化队列，然后返回node；acquireQueued方法只有一种情况会返回，就是获取到锁的时候，这个时候，返回的是false



### tryAcquire

```java

protected final boolean tryAcquire(int acquires) {

    final Thread current = Thread.currentThread();

    //state由于是int类型，而int类型在java中默认为0

    int c = getState();

    if (c == 0) {

    //hasQueuedPredecessors这个方法就是用来判断是有线程在阻塞队列里面等待了，true是有，false是没有

    //compareAndSetState很简单，就是cas，比较替换，如果前面判断是true的话，就说明是没有线程在等待的，于是就把当前线程的state的值从0替换为1

    //前面两个都为true了，就将线程设置为独占模式

        if (!hasQueuedPredecessors() &&

            compareAndSetState(0, acquires)) {

            setExclusiveOwnerThread(current);

            return true;

        }

    }

    //走到这里，说明有线程在阻塞队列当中等待或者cas替换失败，cas替换失败，说明此时并发地有两个或两个以上的线程在并发cas，而当前cas失败了

    //判断当前线程是不是就是持有锁的这个线程，是的话，就是state+1

    else if (current == getExclusiveOwnerThread()) {

        int nextc = c + acquires;

        if (nextc < 0)

            throw new Error("Maximum lock count exceeded");

        setState(nextc);

        return true;

    }

    //走到这里说明当前阻塞队列当中有节点或者cas失败，并且当前线程没有锁

    return false;

}

```

### hasQueuedPredecessors

```java

public final boolean hasQueuedPredecessors() {

//1. 判断这个队列不是空的

//2. 判断当前线程和阻塞队列的第一个节点的线程是不是一个线程

    Node t = tail; 

    Node h = head;

    Node s;

    return h != t &&

        ((s = h.next) == null || s.thread != Thread.currentThread());

}

```

### addWaiter

```java

private Node addWaiter(Node mode) {

    Node node = new Node(Thread.currentThread(), mode);

    // Try the fast path of enq; backup to full enq on failure

    Node pred = tail;

//tail!=null => 队列不为空(tail==head的时候，其实队列是空的)

    if (pred != null) {

        node.prev = pred;

        if (compareAndSetTail(pred, node)) {

            pred.next = node;

            return node;

        }

    }

        // 如果会到这里,说明 pred==null(队列是空的) 或者 CAS失败(有线程在竞争入队)

    enq(node);

    return node;

}

```



### enq

```java

    // 采用自旋的方式入队

    // 之前说过，到这个方法只有两种可能：等待队列为空，或者有线程竞争入队，

    // 自旋在这边的语义是：CAS设置tail过程中，竞争一次竞争不到，我就多次竞争，总会排到的

private Node enq(final Node node) {

    for (;;) {

        Node t = tail;

        if (t == null) { // Must initialize

            if (compareAndSetHead(new Node()))

                tail = head;

                //这里有点意思，在空队列中插入一个节点之后，没有直接返回，而是继续进行循环，第二次就走到了else中

        } else {

        //一直循环，目的就是将当前线程排到最后面

            node.prev = t;

            if (compareAndSetTail(t, node)) {

                t.next = node;

                return t;

            }

        }

    }

}

```

### acquireQueued

```java

    // 下面这个方法，参数node，经过addWaiter(Node.EXCLUSIVE)，此时已经进入阻塞队列

    // 注意一下：如果acquireQueued(addWaiter(Node.EXCLUSIVE), arg))返回true的话，

    // 意味着上面这段代码将进入selfInterrupt()，所以正常情况下，下面应该返回false

    // 这个方法非常重要，应该说真正的线程挂起，然后被唤醒后去获取锁，都在这个方法里了

final boolean acquireQueued(final Node node, int arg) {

    boolean failed = true;

    try {

        boolean interrupted = false;

        for (;;) {

        //查看node的前驱结点是否为null，不是的话，返回前驱结点

            final Node p = node.predecessor();

// p == head 说明当前节点虽然进到了阻塞队列，但是是阻塞队列的第一个，因为它的前驱是head

 // 注意，阻塞队列不包含head节点，head一般指的是占有锁的线程，head后面的才称为阻塞队列

// 所以当前节点可以去试抢一下锁

// 这里我们说一下，为什么可以去试试：

// 首先，它是队头，这个是第一个条件，其次，当前的head有可能是刚刚初始化的node，

// enq(node) 方法里面有提到，head是延时初始化的，而且new Node()的时候没有设置任何线程

 // 也就是说，当前的head不属于任何一个线程，所以作为队头，可以去试一试，

// tryAcquire已经分析过了, 忘记了请往前看一下，就是简单用CAS试操作一下state

            if (p == head && tryAcquire(arg)) {

//走到这里说明当前节点在阻塞队列中是队头，并且获取锁成功了

//所以将当前节点从阻塞队列中弹出

                setHead(node);

                p.next = null; // help GC

                failed = false;

                return interrupted;

            }

// 到这里，说明上面的if分支没有成功，要么当前node本来就不是队头，

 // 要么就是tryAcquire(arg)没有抢赢别人

 //shouldParkAfterFailedAcquire方法返回ture的唯一条件就

 //是p也就是node的前驱结点的state值为-1，-1说明的是后驱节点需要被唤醒

 //parkAndCheckInterrupt这个方法的作用就是将线程的状态从阻塞转换到等待，

 //进入等待队列，等待被cpu唤醒

            if (shouldParkAfterFailedAcquire(p, node) &&

                parkAndCheckInterrupt())

                interrupted = true;

        }

    } finally {

    

           // 什么时候 failed 会为 true???

           // tryAcquire() 方法抛异常的情况

        if (failed)

            cancelAcquire(node);

    }

}

```



### shouldParkAfterFailedAcquire

```java

// 刚刚说过，会到这里就是没有抢到锁呗，这个方法说的是："当前线程没有抢到锁，是否需要挂起当前线程？"

 // 第一个参数是前驱节点，第二个参数才是代表当前线程的节点

private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {

    int ws = pred.waitStatus;

//signal说明需要唤醒当前节点的后继节点

    if (ws == Node.SIGNAL)

        /*

         * This node has already set status asking a release

         * to signal it, so it can safely park.

         */

        return true;

       // 大于0 说明前驱节点取消了排队。

       //一直往前遍历，直到state>0

    if (ws > 0) {

        do {

            node.prev = pred = pred.prev;

        } while (pred.waitStatus > 0);

        pred.next = node;

    } else {

    // 用CAS将前驱节点的waitStatus设置为Node.SIGNAL(也就是-1)

        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);

    }

    return false;

}

```

分析一下，这个方法最多几次之后可以返回true。

从这个方法的判断条件可以看出，state的值应该是三种情况

1. 0

2. -1

3. 大于0

那么我们就一一来谈论，

1. 如果是0，就会将变为-1，第二次进来直接返回（其实这种情况并不存在，因为每个进来阻塞队列的线程最终都会变成-1）

2. 如果是-1，进来之后就直接返回

3. 如果是大于0，那么要进入循环，直到前缀节点等于0或者等于-1的时候才会返回，如果是等于0，第二次进来就会走到第一种情况，总的来说就是到了第三次才会返回true。

所以，这个方法最多三次可以返回true。

### cancelAcquire

```java

private void cancelAcquire(Node node) {

    // Ignore if node doesn't exist

    if (node == null)

        return;



    node.thread = null;



    // Skip cancelled predecessors

    Node pred = node.prev;

    while (pred.waitStatus > 0)

        node.prev = pred = pred.prev;



    // predNext is the apparent node to unsplice. CASes below will

    // fail if not, in which case, we lost race vs another cancel

    // or signal, so no further action is necessary.

    Node predNext = pred.next;



    // Can use unconditional write instead of CAS here.

    // After this atomic step, other Nodes can skip past us.

    // Before, we are free of interference from other threads.

    node.waitStatus = Node.CANCELLED;



    // If we are the tail, remove ourselves.

    if (node == tail && compareAndSetTail(node, pred)) {

        compareAndSetNext(pred, predNext, null);

    } else {

        // If successor needs signal, try to set pred's next-link

        // so it will get one. Otherwise wake it up to propagate.

        int ws;

        if (pred != head &&

            ((ws = pred.waitStatus) == Node.SIGNAL ||

             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&

            pred.thread != null) {

            Node next = node.next;

            if (next != null && next.waitStatus <= 0)

                compareAndSetNext(pred, predNext, next);

        } else {

            unparkSuccessor(node);

        }



        node.next = node; // help GC

    }

}

```

### parkAndCheckInterrupt

```java



private final boolean parkAndCheckInterrupt() {

//挂起线程，其实就是就是进入到java六中线程状态的一种 等待状态

//走到这里之后，就会等待线程被唤醒，等到线程被唤醒之后，才会retrun

    LockSupport.park(this);

    return Thread.interrupted();

}

```

## FairSync-unlock

### unlock

```java

public void unlock() {

    sync.release(1);

}

```

### release

```java

public final boolean release(int arg) {

//如果尝试取消锁成功，会返回true

    if (tryRelease(arg)) {

        Node h = head;

        if (h != null && h.waitStatus != 0)

            unparkSuccessor(h);

        return true;

    }

    return false;

}

```

### tryRelease

```java

protected final boolean tryRelease(int releases) {

    int c = getState() - releases;

    //判断当前线程是不是获取锁的那个线程，不是的话，抛出异常

    if (Thread.currentThread() != getExclusiveOwnerThread())

        throw new IllegalMonitorStateException();

    boolean free = false;

    if (c == 0) {

        free = true;

        setExclusiveOwnerThread(null);

    }

    setState(c);

    return free;

}

```

### unparkSuccessor

```java

private void unparkSuccessor(Node node) {

    /*

     * If status is negative (i.e., possibly needing signal) try

     * to clear in anticipation of signalling.  It is OK if this

     * fails or if status is changed by waiting thread.

     */

    int ws = node.waitStatus;

    if (ws < 0)

    // 如果head节点当前waitStatus<0, 将其修改为0

        compareAndSetWaitStatus(node, ws, 0);



    /*

     * Thread to unpark is held in successor, which is normally

     * just the next node.  But if cancelled or apparently null,

     * traverse backwards from tail to find the actual

     * non-cancelled successor.

     */

// 下面的代码就是唤醒后继节点，但是有可能后继节点取消了等待（waitStatus==1）

    // 从队尾往前找，找到waitStatus<=0的所有节点中排在最前面的

    Node s = node.next;

    if (s == null || s.waitStatus > 0) {

        s = null;

// 从后往前找，仔细看代码，不必担心中间有节点取消(waitStatus==1)的情况

        for (Node t = tail; t != null && t != node; t = t.prev)

            if (t.waitStatus <= 0)

                s = t;

    }

    if (s != null)

        LockSupport.unpark(s.thread);

}

```

> [AQS](https://javadoop.com/post/AbstractQueuedSynchronizer)