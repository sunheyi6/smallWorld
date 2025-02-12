---
title: ReentrantLock.lock（公平锁）最多要尝试加锁几次才会挂起？
description: ""
tags:
  - 无标签
pubDate: 2021-07-20
---


你猜猜



<!-- more -->



# 不同点



其实第一种情况和第二次情况，都是在tryAcquire这个方法的差别，



## tryAcquire



```java

protected final boolean tryAcquire(int acquires) {

    final Thread current = Thread.currentThread();

    int c = getState();

    if (c == 0) {

        if (!hasQueuedPredecessors() &&

            compareAndSetState(0, acquires)) {

            setExclusiveOwnerThread(current);

            return true;

        }

    }



    else if (current == getExclusiveOwnerThread()) {

        int nextc = c + acquires;

        if (nextc < 0)

            throw new Error("Maximum lock count exceeded");

        setState(nextc);

        return true;

    }

    return false;

}

```

主要是!hasQueuedPredecessors()这个方法区别了两种情况，如果为true，就会进行尝试，如果false，就不会，代码就会往下走

## hasQueuedPredecessors

```java

public final boolean hasQueuedPredecessors() {

    Node t = tail; 

    Node h = head;

    Node s;

    return h != t &&

        ((s = h.next) == null || s.thread != Thread.currentThread());

}

```

!hasQueuedPredecessors()的两种情况

1. true 阻塞队列为空，或者队列不为空，头结点的下一个节点不是null，并且头结点的下一个节点的线程和当前线程是同一个线程的时候

2. false 阻塞队列不为空，或者头结点的下一个节点是null，或者头结点下一个节点的线程和当前线程不相同

# 相同点

## acquireQueued

```java

final boolean acquireQueued(final Node node, int arg) {

    boolean failed = true;

    try {

        boolean interrupted = false;

        for (;;) {

            final Node p = node.predecessor();

            if (p == head && tryAcquire(arg)) {



                setHead(node);

                p.next = null; // help GC

                failed = false;

                return interrupted;

            }

            if (shouldParkAfterFailedAcquire(p, node) &&

                parkAndCheckInterrupt())

                interrupted = true;

        }

    } finally {

        if (failed)

            cancelAcquire(node);

    }

}

```

这个方法其实看起来也很简单，第一次进来就是判断是不是头结点，如果是头结点就尝试获取锁，如果不是就走shouldParkAfterFailedAcquire方法

> - 注意这个方法只有在当前节点的前缀节点是头结点的时候才能进行尝试获取锁

> - 只有当一进来的时候，当前节点是头结点才会进行尝试，如果一进来，当前节点的前缀节点不是头结点，之后三次，就都不太可能进行尝试，因为node节点的位置并没有发生变化，但是好像也存在一种极端情况，就是阻塞队列中的一个节点到当前节点中间的节点都不打算等待了，然后当前节点就直接挂在了头结点的后面，于是再次进入这个方法就会进行尝试了

> -  在acquireQueued方法中，如果考虑极端情况，如果一进来，当前节点的前缀节点就是头结点，并且当前线程和头结点线程不同，而且三次都尝试获取失败，那么最多可以尝试三次获取锁

> - 当然也存在一种情况，就是当前节点的前缀节点是头结点，并且当前线程节点和头结点线程的线程相同，那么会在tryAcquire的方法中直接返回true

## shouldParkAfterFailedAcquire



```java

private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {

    int ws = pred.waitStatus;

    if (ws == Node.SIGNAL)

        return true;

    if (ws > 0) {

        do {

            node.prev = pred = pred.prev;

        } while (pred.waitStatus > 0);

        pred.next = node;

    } else {

        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);

    }

    return false;

}

````

分析一下，这个方法最多几次之后可以返回true。 从这个方法的判断条件可以看出，state的值应该是三种情况



1.  0

1.  -1

1.  大于0



那么我们就一一来谈论，



1.  如果是0，就会将变为-1，第二次进来直接返回（其实这种情况并不存在，因为每个进来阻塞队列的线程最终都会变成-1，但是如果这个节点之后还没有新的节点进来，那么可能是0）

1.  如果是-1，进来之后就直接返回

1.  如果是大于0，那么要进入循环，直到前缀节点等于0或者等于-1的时候才会返回，如果是等于0，第二次进来就会走到第一种情况，总的来说就是到了第三次才会返回true。



所以，这个方法最多三次可以返回true。

### waitState的变化



![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/736dd6e2e89e4803b62e5eeeb52ba0ca~tplv-k3u1fbpfcp-watermark.image)



![39b79058776f552eb5cab0401b72293.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/595621b843b946ab9ae4fbb2e808a4bf~tplv-k3u1fbpfcp-watermark.image)

# 结论

分为两种情况，

1. 阻塞队列为空，或者队列不为空，头结点的下一个节点不是null，并且头结点的下一个节点的线程和当前线程是同一个线程的时候，这个时候最多3次尝试

> 两次尝试的这种结果，是阻塞队列为空，tryAcquire会尝试一次，接着走到addWaiter，当前节点就会变为阻塞队列的头结点，此时state为0，然后走acquireQueued，因为state为0所以会进行两次尝试shouldParkAfterFailedAcquire就会返回true了，那么最多就是三次尝试

2. 阻塞队列不为空，或者头结点的下一个节点是null，或者头结点下一个节点的线程和当前线程不相同，这个时候最多3次尝试



> 头结点的下一个节点和当前线程不是一个线程，假设一直竞争锁失败，那么最终