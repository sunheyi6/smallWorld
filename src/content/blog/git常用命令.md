---
title: git常用命令
description: 
tags:
  - 无标签
pubDate: 2022-01-28
---


## 用户名密码



```git

# 查看git 用户名

git config --global user.name

# 查看git email

git config --global user.email

```



## 配置



```git

# 查看全局的配置

git config --global -l

# 查看https的代理 直接在后面跟上代理地址就可以设置代理

git config --global  https.proxy

# 查看http的代理 直接在后面跟上代理地址就可以设置代理

git config --global  http.proxy

# 取消http代理

git config --global --unset http.proxy

# 取消https代理

git config --global --unset https.proxy

# 当连接github的时候使用的ssh的方式

git config --global socket.proxy 127.0.0.1:9981

```



## 强制覆盖



```git

git fetch --all &&  git reset --hard origin/master && git pull

```



## 远程分支



- 查看本地分支



```git

git branch

```



- 查看远程分支



```git

git brach -r

```



- 查看所有分支



```git

git branch -a

```



- 将本地新建的分支与远程分支相关联（在当前分支下输入以下命令）

- 两种方式



```git

git branch -u origin/分支名   其中origin/分支名 中分支名 为远程分支名

 git branch –-set-upstream-to=origin/分支名 本地分支名

```



- 撤销本地分支与远程分支的关系



```git

git branch --unset-upstream

```



## 改变远程分支名字



本地分支是可以直接修改名字，但是远程不行，步骤：



1. 改变本地分支名字

2. 删除远程分支（当然在此之前要将本地分支和远程分支同步）

3. 将本地分支推送到 远程分支

4. 将本地分支和远程分支关联起来



```git

git branch -m oldBranch newBranch

git push --delete origin oldBranch

git push origin newBranch

git branch --set-upstream-to origin/newBranch

```



## 回退版本



### reset



- git reset: 回滚到某次提交。

- git reset --soft: 此次提交之后的修改会被退回到暂存区。

- git reset --hard 此次提交之后的修改不做任何保留，git status 查看工作区是没有记录的。



### revert



- git revert : 之前的提交仍会保留在 git log 中，而此次撤销会做为一次新的提交。

- git revert -m :用于对 merge 节点的操作，-m 指定具体某个提交点。



## ssh生成



```bash

ssh-keygen -t ed25519 -C "your_email@example.com"

```



> 如果是比较老的系统不支持，可以使用

>

> ```bash

> ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

> ```
