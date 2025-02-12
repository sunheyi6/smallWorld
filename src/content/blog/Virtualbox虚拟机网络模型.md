---
title: Virtualbox虚拟机网络模型
description: ""
tags:
  - 无标签
pubDate: 2022-10-02
---


# VirrtualBox和VMware简单对比

两者都是优秀的虚拟机平台，我们可以通过它们创建虚拟机来安装不同环境的操作系统



主要区别对比：



VirtualBox是开源免费软件，下载和安装比较方便，VMware功能更加强大，但是需要注册码



VirtualBox相对于VMware安装和配置更加简单，运行内存占用也比较小



VirtualBox由于是开源免费，社区相对更加活跃，但总体两者出现问题都能找到解决方案



# 常见的网络模型

主要有下面四种网络模型



- 桥接（Bridge Adapter）

- NAT

- 主机网络（Host-only Adapter）

- 内部网络（Internal）

> VirtualBox包含了以上的四种网络模型，VMware只有前三种



四种模型之间的差别

![image-1664718964443](https://shyblog.oss-cn-beijing.aliyuncs.com/img/image-1664718964443.png)

## 桥接

桥接网络模型依赖虚拟交换机（Linux bridge）将虚拟机和物理机连接起来，它们之间处在同一个二层网络



虚拟机和物理机的ip处在相同网段之下，举例，比如都处在192.168.100.x的网段之下，物理机ip为192.168.100.10，虚拟机ip为192.168.100.20



桥接网络的网络连通总结：



虚拟机之间彼此互通



虚拟机和物理机彼此互通



只要物理机能上外网，虚拟机也能上外网



3.2 网络原理图

# 参考

- [【计算机网络】：一次性理清Virtualbox虚拟机网络模型](https://joyohub.com/2021/03/13/network/virtoolbox-network/)
