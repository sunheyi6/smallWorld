---
title: session，cookie和token
description: ""
tags:
  - 无标签
pubDate: 2021-05-15
---


## http



什么是无状态呢？就是说这一次请求和上一次请求是没有任何关系的，互不认识的，没有关联的。这种无状态的的好处是快速。坏处是假如我们想要把`www.zhihu.com/login.html`和`www.zhihu.com/index.html`关联起来，必须使用某些手段和工具



## cookie和session



cookie是session的一种实现方案



客户端访问服务器的流程如下：



- 首先，客户端会发送一个http请求到服务器端。

- 服务器端接受客户端请求后，建立一个session，并发送一个http响应到客户端，这个响应头，其中就包含Set-Cookie头部。该头部包含了sessionId。Set-Cookie格式如下，具体请看[Cookie详解](http://bubkoo.com/2014/04/21/http-cookies-explained/)

  `Set-Cookie: value[; expires=pubDate][; domain=domain][; path=path][; secure]`

- 在客户端发起的第二次请求，假如服务器给了set-Cookie，浏览器会自动在请求头中添加cookie

- 服务器接收请求，分解cookie，验证信息，核对成功后返回response给客户端



### 注意



- cookie只是实现session的其中一种方案。虽然是最常用的，但并不是唯一的方法。禁用cookie后还有其他方法存储，比如放在url中

- 现在大多都是Session + Cookie，但是只用session不用cookie，或是只用cookie，不用session在理论上都可以保持会话状态。可是实际中因为多种原因，一般不会单独使用

- 用session只需要在客户端保存一个id，实际上大量数据都是保存在服务端。如果全部用cookie，数据量大的时候客户端是没有那么多空间的。

- 如果只用cookie不用session，那么账户信息全部保存在客户端，一旦被劫持，全部信息都会泄露。并且客户端数据量变大，网络传输的数据量也会变大



### 区别



- session是保存在服务端的，cookie是保存在客户端的



## token



token 也称作令牌，由uid+time+sign[+固定参数]

token 的认证方式类似于**临时的证书签名**, 并且是一种服务端无状态的认证方式, 非常适合于 REST API 的场景. 所谓无状态就是服务端并不会保存身份认证相关的数据。



### 组成



- uid: 用户唯一身份标识

- time: 当前时间的时间戳

- sign: 签名, 使用 hash/encrypt 压缩成定长的十六进制字符串，以防止第三方恶意拼接

- 固定参数(可选): 将一些常用的固定参数加入到 token 中是为了避免重复查库



### 存放



token在客户端一般存放于localStorage，cookie，或sessionStorage中。在服务器一般存于数据库中



> 参考链接：

>

> - https://segmentfault.com/a/1190000017831088