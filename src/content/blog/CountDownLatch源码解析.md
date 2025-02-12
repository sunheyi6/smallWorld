---
title: CountDownLatch源码解析
description: 
tags:
  - 无标签
pubDate: 2021-08-21
---


CountDownLatch源码解析



<!-- more -->



# 使用场景



1. 在一个任务需要多个线程来执行，并且是需要线程在同一时间一起开始执行，这样的话，可以使用CountDownLatch

# 本质



1. 虽然CountDownLatch这个类并没有直接继承AbstractQueuedSynchronizer,但是他使用的一个final修饰的变量sync继承AbstractQueuedSynchronizer，所以其本质上还是使用了AQS的共享模式

2. 这个类的作用实际上就是在线程开始之后设置了一个栅栏，这个栅栏将所有线程阻塞住了，只有所有线程都激活的情况下，栅栏才会消失

# 图解



![image-20210822195328075](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210822195328075.png)



# 源码分析

## Sync

```java

private static final class Sync extends AbstractQueuedSynchronizer {

    private static final long serialVersionUID = 4982264981922014374L;

//实际上这个count相当于AQS中的state

    Sync(int count) {

        setState(count);

    }

//获取state的状态

    int getCount() {

        return getState();

    }

```

### tryAcquireShared

```java

    //尝试获取共享锁

    //其实一个线程的初始状态就是0，但是由于加入队列的时候，设置state的状态为shared，所以第一次进来一般不会时0，所以直接返回-1

    protected int tryAcquireShared(int acquires) {

        return (getState() == 0) ? 1 : -1;

    }

```

### tryReleaseShared

```java

//用自旋的方法实现 state 减 1

protected boolean tryReleaseShared(int releases) {

    // Decrement count; signal when transition to zero

    for (;;) {

        int c = getState();

        if (c == 0)

            return false;

        int nextc = c-1;

        if (compareAndSetState(c, nextc))

  //重点在这里，是判断nextc等于0之后才会提出循环，

  //所以其实就是将state变为1才会跳出循环，返回true

            return nextc == 0;

    }

}

```

## await

```java

public void await() throws InterruptedException {

    sync.acquireSharedInterruptibly(1);

}

```

### acquireSharedInterruptibly

```java

public final void acquireSharedInterruptibly(int arg)

        throws InterruptedException {

     //查看当前线程是否被中断

    if (Thread.interrupted())

        throw new InterruptedException();

    //tryAcquireShared方法就是上面sync中继承aqs重写的方法

    //其实就是判断线程状态是否为0，为0，返回1，否则返回-1

    if (tryAcquireShared(arg) < 0)

        doAcquireSharedInterruptibly(arg);

}

```

### doAcquireSharedInterruptibly

```java

private void doAcquireSharedInterruptibly(int arg)

    throws InterruptedException {

    //将当前节点加入阻塞队列中

    final Node node = addWaiter(Node.SHARED);

    boolean failed = true;

    try {

        for (;;) {

        //返回上一个节点，用来帮助gc

            final Node p = node.predecessor();

            if (p == head) {

            // 只要 state 不等于 0，那么这个方法返回 -1

                int r = tryAcquireShared(arg);

                if (r >= 0) {

                    setHeadAndPropagate(node, r);

                    p.next = null; // help GC

                    failed = false;

                    return;

                }

            }

            //删除取消等待的节点，然后将前一个节点的state设置为

            -1

            if (shouldParkAfterFailedAcquire(p, node) &&

                parkAndCheckInterrupt())

                throw new InterruptedException();

        }

    } finally {

        if (failed)

            cancelAcquire(node);

    }

}

```

### predecessor

```java

final Node predecessor() throws NullPointerException {

    Node p = prev;

    if (p == null)

        throw new NullPointerException();

    else

        return p;

}

```

## countDown

```java

public void countDown() {

    sync.releaseShared(1);

}

```

### releaseShared

```java

public final boolean releaseShared(int arg) {

   // 只有当 state 减为 0 的时候，tryReleaseShared 才返回 true

    // 否则只是简单的 state = state - 1 那么 countDown() 方法就结束了

    //    将 state 减到 0 的那个操作才是最复杂的，继续往下吧

    if (tryReleaseShared(arg)) {

        doReleaseShared();

        return true;

    }

    return false;

}

```

### doReleaseShared

```java

private void doReleaseShared() {

    for (;;) {

        Node h = head;

        if (h != null && h != tail) {

            int ws = h.waitStatus;

            if (ws == Node.SIGNAL) {

  //比较替换，期待是-1，想要将其变为0

                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))

                    continue;            

        //  唤醒 head 的后继节点，也就是阻塞队列中的第一个节点

                unparkSuccessor(h);

            }

            else if (ws == 0 &&

                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))

                continue;                // loop on failed CAS

        }

        if (h == head)                   // loop if head changed

            break;

    }

}

```

#### unparkSuccessor

```java

private void unparkSuccessor(Node node) {

//获取到节点的状态

    int ws = node.waitStatus;

    if (ws < 0)

        compareAndSetWaitStatus(node, ws, 0);



    Node s = node.next;

    if (s == null || s.waitStatus > 0) {

        s = null;

        for (Node t = tail; t != null && t != node; t = t.prev)

            if (t.waitStatus <= 0)

                s = t;

    }

    if (s != null)

        LockSupport.unpark(s.thread);

}

```

参考链接：

 [一行一行源码分析清楚 AbstractQueuedSynchronizer (三)](https://javadoop.com/post/AbstractQueuedSynchronizer-3)