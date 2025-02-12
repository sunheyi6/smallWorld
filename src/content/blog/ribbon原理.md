---
title: ribbon原理
description: ""
tags:
  - 无标签
pubDate: 2022-03-23
---


# 注解

## @LoadBalanced

![image.png](https://shyblog.oss-cn-beijing.aliyuncs.com/img//image_1648026993336.png)

LoadBalanced没有@import什么的，只有一个@Qualifier

### LoadBalancerAutoConfiguration

在LoadBalancerAutoConfiguration中用了@LoadBalanced

![image.png](https://shyblog.oss-cn-beijing.aliyuncs.com/img//image_1648027060344.png)

将所有具有负载均衡标识的RestTemplate类型的Bean注入到集合中

```java

    @Bean

    @LoadBalanced

    public RestTemplate restTemplate(){

        return new RestTemplate();

    }

```

使用一般这样使用

# 参考

- [Ribbon中@LoadBalanced注解的原理](https://blog.51cto.com/u_14643435/2866253)
