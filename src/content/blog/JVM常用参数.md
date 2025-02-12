---
title: JVM常用参数
description: ""
tags:
  - 无标签
pubDate: 2021-04-26
---


常用参数和日志打印



<!-- more -->



## 常用设置



| 参数                                 | 解释                                                         |

| ------------------------------------ | ------------------------------------------------------------ |

| -Xms                                 | java堆内存的大小                                             |

| -Xmx                                 | java堆内存的最大大小                                         |

| -XX:PeremSize                        | 永久代大小                                                   |

| -XX:MaxpermSize                      | 永久代最大大小                                               |

| -Xmn                                 | 堆内存中的新生代大小                                         |

| -Xss                                 | 每个线程栈内存的大小                                         |

| -XX:Max Tenuring Threshold           | 多少岁进入老年代，默认是15                                   |

| -XX PretenureSize Threshold          | 对象多大直接进入老年代，不经过新生代                         |

| -XX HandlePromotionFailure           | 是否要进行判断 判断老年代的内存大小是都大于之前每一次minor gc之后的进入老年代的对象的平均大小 |

| -XX：SurvivorRatio=8                 | 表示eden区域占比为80%                                        |

| -XX: +UseParNewGC                    | 定垃圾回收器为ParNew，一般来说机器是几核，垃圾回收器并发执行的线程就会有几个，四核机器就是4个，8核机器就是8个 |

| -XX：ParallelGCThreads               | 设置垃圾回收器使用线程数量，一般来说不要动                   |

| -XX: NewSize                         | 新生代                                                       |

| -XX: +UserCMSCOmpactAtFullCollection | 整理碎片                                                     |

| -XX: CMSFullBeforeCompaction=5       | 五次fullgc之后进行一次碎片整理                               |

| XX:CMSInitiatingOccupancyFraction    | 设置CMS老年代回收阀值百分比                                  |

| -XX:+CMSParallelInitialMarkEnabled   | CMS垃圾回收器的“初始标记”阶段开启多线程并发执行              |

| -XX:+CMSScavengeBeforeRemark         | CMS的重新标记阶段之前，先尽量执行一次Young GC，原因：如果大部分新生代的对象被回收掉了，那么作为GC根的部分少了，从而提高重新标记的效率 |

| -XX：TraceClassLoding                | 追踪类加载情况                                               |

| -XX: TraceClassUnloading             | 追踪类卸载情况                                               |

| -XX: SoftRefLRUPolicyMSPerMB         | 软引用存活时间                                               |

| -XX:+DisableExplicltGC               | 禁止显示执行GC，为了避免开发工程师调用system.gc()，在流量高时候频发触发full gc |

| -XX:MetaspaceSize=10M                | 元空间内存设置                                               |

| -XX:MaxMetaspaceSize=10M             | 元空间最大内存设置                                           |

| -XX:+UseConcMarkSweepGC              | 使用CMS垃圾回收器                                            |



## 打印日志



| 参数                                | 作用                        |

| ----------------------------------- | --------------------------- |

| -XX：+PrintGCDetails                | 打印gc详细日志              |

| -XX:HeapDumpPath=/usr/local/app/oom | 内存快照存放位置            |

| -XX:+HeapDumpOnOutOfMemoryError     | 在oom的时候自动dump快照出来 |

| -XX：+PrintGC                       | 打印gc日志                  |

| -XX: =PrintGCTimesStamps            | 打印gc时间戳                |

| -XX: +PrintHeapAtGC                 | gc之后，打印堆信息          |

| -Xloggc                             | 打印日志                    |


