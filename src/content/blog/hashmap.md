---
title: hashmap
description: 
tags:
  - 无标签
pubDate: 2021-04-29
---


java八股文之hashmap



<!-- more -->



### 基本认识



```java

//默认初始容量 - 必须是2的幂次方

static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; 

//hashmap的最大容量 2的30次方

static final int MAXIMUM_CAPACITY = 1 << 30;

//负载因数

static final float DEFAULT_LOAD_FACTOR = 0.75f;

//链表数量达到八开始向红黑树转换

static final int TREEIFY_THRESHOLD = 8;

//当红黑树的节点少于6时，则转换为单链表存储

static final int UNTREEIFY_THRESHOLD = 6;

//虽然在hash冲突发生的时候，默认使用单链表存储，当单链表节点个数大于8时，会转换为红黑树存储

//但是有一个前提（很多文章都没说）：要求数组长度大于64，否则不会进行转换，而是进行扩容。

static final int MIN_TREEIFY_CAPACITY = 64;

```



#### **最大容量为什么是不超过1<<30？**



int类型的数据所占空间大小为32位，所以如果超过这个范围之后，会**出现溢出**。所以，**1<<30是在int类型取值范围中2次幂的最大值**，即为HashMap的容量最大值。



####  **为什么要将链表中转红黑树的阈值设为8？**



HashMap不直接使用红黑树，**是因为树节点所占空间是普通节点的两倍**，所以只有当节点足够的时候，才会使用树节点。也就是说，尽管时间复杂度上，红黑树比链表好一点，但是红黑树所占的空间比较大，所以综合考虑之下，只有在链表节点数太多的时候，红黑树占空间大这一劣势不太明显的时候，才会舍弃链表，使用红黑树。



所以说阈值设置为8是一个将内存和性能折中的一个方案



#### 1.8和1.7的区别



1. hashmap1.8之后，结构为 数组+链表+红黑树，而1.7只是数据+链表



![](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210429120122736.png)



2. 1.7扩容时需要重新计算哈希值和索引位置，1.8并不重新计算哈希值，巧妙地采用和扩容后容量进行&操作来计算新的索引位置。

3. 1.7插入元素到单链表中采用头插入法，1.8采用的是尾插入法。



> 解决hash冲突的方法：

>

> 1. 开发定址法：所谓开放定址法，即是由关键码得到的哈希地址一旦产生了冲突，也就是说，该地址已经存放了数据元素，就去寻找下一个空的哈希地址，只要哈希表足够大，空的哈希地址总能找到，并将数据元素存入。

> 2. 链地址法：hash值一样的key，会在这个数据后面新建一个链表，每次增加就直接在链表后面加节点即可



#### 链表为什么用尾插法



为了安全，因为头插法多线程情况下会导致链表成环



> [链表成环视频讲解](https://www.bilibili.com/video/BV1n541177Ea?from=search&seid=3398389594020314132)



那么为什么到了1.8版本才进行修改那？



其实是因为多线程下的hashmap本就不安全，在多线程场景下如果要使用map，也不会使用hashmap，因此等开发人员想到了，才进行修改



#### 为什么扩容时两倍扩容



[文章](https://blog.csdn.net/Apeopl/article/details/88935422)



主要是与扩容时候的额resize方法有关，resize方法中(n - 1) & hash的计算方法有关



其中n是集合的容量，hash是添加的元素进过hash函数计算出来的hash值。



容量是2的n次幂，主要原因是可以使得添加的元素均匀分布在HashMap中的数组上，减少hash碰撞，避免形成链表的结构，使得查询效率降低！



### 方法



#### hash



##### hashcode



hashcode就是通过hash函数得来的，通俗的说，就是通过某一种算法得到的，hashcode就是在**hash表中有对应的位置**。



通过对象的内部地址(也就是物理地址)转换成一个整数，然后该整数通过hash函数的算法就得到了hashcode(不同jvm的实现不同, hotspot的实现贴在了最后)，所以，hashcode是什么呢？就是在hash表中对应的位置。这里如果还不是很清楚的话，举个例子，hash表中有 hashcode为1、hashcode为2、(...)3、4、5、6、7、8这样八个位置，有一个对象A，A的物理地址转换为一个整数17(这是假如)，就通过直接取余算法，17%8=1，那么A的hashcode就为1，且A就在hash表中1的位置。



###### 为什么使用hashcode



很简单，因为hashcode快啊。



**HashCode是用来在散列存储结构中确定对象的存储地址的**



HashMap 之所以速度快，因为他使用的是散列表，**根据 key 的 hashcode 值生成数组下标**（通过内存地址直接查找，不需要判断, 但是需要多出很多内存，相当于**以空间换时间**）



##### 代码实现



```java

static final int hash(Object key) {

    int h;

    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);

}

```



```java

public native int hashCode();

```



h是调用c写的hashcode的方法获取到的哈希值



h与h向右移动16位进行异或



> 异或的规则是： 相同为0，不同为1



#### hashmap



```java

public HashMap(int initialCapacity, float loadFactor) {

    if (initialCapacity < 0)

        throw new IllegalArgumentException("Illegal initial capacity: " +

                                           initialCapacity);

    if (initialCapacity > MAXIMUM_CAPACITY)

        initialCapacity = MAXIMUM_CAPACITY;

    if (loadFactor <= 0 || Float.isNaN(loadFactor))

        throw new IllegalArgumentException("Illegal load factor: " +

                                           loadFactor);

    this.loadFactor = loadFactor;

    this.threshold = tableSizeFor(initialCapacity);

}



/**

 * Constructs an empty <tt>HashMap</tt> with the specified initial

 * capacity and the default load factor (0.75).

 *

 * @param  initialCapacity the initial capacity.

 * @throws IllegalArgumentException if the initial capacity is negative.

 */

public HashMap(int initialCapacity) {

    this(initialCapacity, DEFAULT_LOAD_FACTOR);

}



/**

 * Constructs an empty <tt>HashMap</tt> with the default initial capacity

 * (16) and the default load factor (0.75).

 */

public HashMap() {

    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted

}

```



hashmap的构造方法，三种初始化hashmap的形式



#### resize



```java

    /**

     * The next size value at which to resize (capacity * load factor).

     *下一个要调整大小的大小值（容量负载因子）

     * @serial

     */

    int threshold;

final Node<K,V>[] resize() {

    Node<K,V>[] oldTab = table;

    int oldCap = (oldTab == null) ? 0 : oldTab.length;

    int oldThr = threshold;

    int newCap, newThr = 0;

    //如果超过最大的容量则不允许扩容，直接返回原数组

    if (oldCap > 0) {

        if (oldCap >= MAXIMUM_CAPACITY) {

            threshold = Integer.MAX_VALUE;

            return oldTab;

        }

        //如果hashmap数量的两倍小于2的32次方并且 大于等于16

        //那么新的hashmap的大小就是原来的两倍

        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&

                 oldCap >= DEFAULT_INITIAL_CAPACITY)

            newThr = oldThr << 1; // double threshold

    }

    else if (oldThr > 0) // initial capacity was placed in threshold

        newCap = oldThr;

    else {               // zero initial threshold signifies using defaults

        newCap = DEFAULT_INITIAL_CAPACITY;

        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);

    }

    if (newThr == 0) {

        float ft = (float)newCap * loadFactor;

        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?

                  (int)ft : Integer.MAX_VALUE);

    }

    threshold = newThr;

    @SuppressWarnings({"rawtypes","unchecked"})

    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];

    table = newTab;

    if (oldTab != null) {

        for (int j = 0; j < oldCap; ++j) {

            Node<K,V> e;

            if ((e = oldTab[j]) != null) {

                oldTab[j] = null;

                //判断e是不是最后一个节点

                if (e.next == null)

                    //重新hash之后放入对应的位置

                    newTab[e.hash & (newCap - 1)] = e;

                //判断这个节点是不是在红黑树中

                else if (e instanceof TreeNode)

                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);

                else { 

                    Node<K,V> loHead = null, loTail = null;

                    Node<K,V> hiHead = null, hiTail = null;

                    Node<K,V> next;

                    do {

                        next = e.next;

                        if ((e.hash & oldCap) == 0) {

                            if (loTail == null)

                                loHead = e;

                            else

                                loTail.next = e;

                            loTail = e;

                        }

                        else {

                            if (hiTail == null)

                                hiHead = e;

                            else

                                hiTail.next = e;

                            hiTail = e;

                        }

                    } while ((e = next) != null);

                    if (loTail != null) {

                        loTail.next = null;

                        newTab[j] = loHead;

                    }

                    if (hiTail != null) {

                        hiTail.next = null;

                        newTab[j + oldCap] = hiHead;

                    }

                }

            }

        }

    }

    return newTab;

}

```



> - hashmap的key只能有一个为null，value可以有多个null

>- HashTable中，无论是key还是value，都不能为null



#### put



```java

public V put(K key, V value) {

    return putVal(hash(key), key, value, false, true);

}

```



#### putVal



```java

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,

               boolean evict) {

    Node<K,V>[] tab; Node<K,V> p; int n, i;

    //如果table数组中没有值，就要初始化一个长度

    if ((tab = table) == null || (n = tab.length) == 0)

        n = (tab = resize()).length;

    //如果数组的这个下标位置没有数据，就将这个数据插入进去

    if ((p = tab[i = (n - 1) & hash]) == null)

        tab[i] = newNode(hash, key, value, null);

    else {

        Node<K,V> e; K k;

        if (p.hash == hash &&

            ((k = p.key) == key || (key != null && key.equals(k))))

            e = p;

        //如果检测到是树节点，就要使用下面这个方法来进行插入元素

        else if (p instanceof TreeNode)

            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);

        else {

            for (int binCount = 0; ; ++binCount) {

                if ((e = p.next) == null) {

                    p.next = newNode(hash, key, value, null);

                    //如果链表的数量大于8，就转换为红黑树

                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st

                        treeifyBin(tab, hash);

                    break;

                }

                if (e.hash == hash &&

                    ((k = e.key) == key || (key != null && key.equals(k))))

                    break;

                p = e;

            }

        }

        if (e != null) { // existing mapping for key

            V oldValue = e.value;

            if (!onlyIfAbsent || oldValue == null)

                e.value = value;

            afterNodeAccess(e);

            return oldValue;

        }

    }

    //记录修改的次数

    ++modCount;

    if (++size > threshold)

        resize();

    afterNodeInsertion(evict);

    return null;

}

```



#### treeifyBin



```java

final void treeifyBin(Node<K,V>[] tab, int hash) {

    int n, index; Node<K,V> e;

    //虽然上面判断链表长度大于8,到了操作树的环节，但是还是判断数据长度大于64才可以将

    //链表转换为红黑树

    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)

        resize();

    else if ((e = tab[index = (n - 1) & hash]) != null) {

        TreeNode<K,V> hd = null, tl = null;

        do {

            TreeNode<K,V> p = replacementTreeNode(e, null);

            if (tl == null)

                hd = p;

            else {

                p.prev = tl;

                tl.next = p;

            }

            tl = p;

        } while ((e = e.next) != null);

        if ((tab[index] = hd) != null)

            hd.treeify(tab);

    }

}

```



### 遍历



#### 方式



##### lambda



```java

Map<Integer, Integer> map = new HashMap<Integer, Integer>();

map.put(2, 10);

map.put(1, 20);

map.put(4,40);

map.put(3,30);

map.forEach((k, v) -> System.out.println("key: " + k + " value:" + v));

```



##### for each



```java

for (Map.Entry<Integer, Integer> entry : map.entrySet()) {

			System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());

		}

```



##### 迭代键值对



```java

// 迭代键

		for (Integer key : map.keySet()) {

			System.out.println("Key = " + key);

		}

 

		// 迭代值

		for (Integer value : map.values()) {

			System.out.println("Value = " + value);

		}

```



#####  Iterator



```java

Iterator<Map.Entry<Integer, Integer>> entries = map.entrySet().iterator();

		while (entries.hasNext()) {

			Map.Entry<Integer, Integer> entry = entries.next();

			System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());

		}

```



#### 原理



虽然hashmap的插入数据是无序的，但是它遍历出来的结果都是有序的,并且每次遍历的结果都一样



> 原因就是因为hashmap的数组下标是 hashcode和hashmap的容量大小  按位与出来的结果



### 线程安全



hashmap是线程不安全的，如果需要保证线程安全，推荐使用ConcurrentHashMap



### 参考文章



[美团技术文章](https://tech.meituan.com/2016/06/24/java-hashmap.html)



[知乎文章](https://zhuanlan.zhihu.com/p/130209918)