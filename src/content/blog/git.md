---
title: git
description: ""
tags:
  - 无标签
pubDate: 2021-04-18
---


[学习链接](https://juejin.cn/post/6844904054477291533#heading-11)



[链接2](https://shidongxu0312.github.io/2019/11/28/Git-原理详解及实用指南/#比对工作目录和暂存区) [官方地址](https://git-scm.com/)



[git在线练习网站](https://learngitbranching.js.org/?demo=&locale=zh_CN)



<!-- more -->



# 原理



![image-20210418091116305](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210418091116305.png)



# 常用命令



## 特殊符号



### ^



一个^代表往前一个commit



比如git rebase HEAD^  ，就是当前的commit往前一个commit



git rebase HEAD^^  ，就是当前的commit往前两个commit



### ~



~5  就是当前的commit往前五个



## HEAD



head就是指向当前的commit



## pull



git pull  将数据从远程仓库拉取到本地仓库



pull的实质是先把代码从远程仓库拉取下来，然后merge



## push



git push 将本地仓库的数据推送到远程仓库中



## branch



```Git

#branch 就是分支的意思



#当前分支切换到a分支

git branch a 

#f是强制的意思，强制将master强制指向head的父节点

git branch -f master HEAD~1 

```



## commit



### git commit —amend



会在分支上真的提交，是一个新的commit，而不是将刚才的commit替换掉，不会操作原commit



> 只有最新的commit出错才可以amend，其他的要用rebase



## checkout



作用：切换分支



```Git

git checkout -b newBranchName

```



## add



add的不是整个文件，是改动的内容



## log



### git log 查看日志



### git log -p 查看详细日志



详细地查看每一行都修改了什么



### git log –stat 查看简要统计



查看的是大概的修改内容



## show



### git show 查看当前的commit



## merge



merge其实就是合并的意思，比如a和b都从远端仓库拉取代码下来，然后修改不同的文件或者同一文件的不同内容，那么就会将不同的地方直接合并，但是如果修改的是同一个文件的相同内容，那么当b或者a当对方先提交的时候，就会发生冲突conflict ，冲突的原因是，你现在的代码和远端仓库的代码不一样，需要保持一样才可以进行合并



```Git

#当前分支和branchName分支合并

git merge branchName  

```



## diff



使用 git diff （不加选项参数）可以显示工作目录和暂存区之间的不同。换句话说，这条指令可以让你看到「如果你现在把所有文件都 add，你会向暂存区中增加哪些内容」



### git diff --staged 比对暂存区和上一条的提交



换句话说，这条指令可以让你看到「如果你立即输入 git commit，你将会提交什么」：



--cached 和--staged一模一样，可以直接替换使用



### git diff head



## rebase



### git rebase -i HEAD^



## reset



### 本质



移动head以及它所指向的branch



### git reset



不加参数，默认是—mixed



工作目录保留，清空暂存区



```Git

#回退三个版本  包括当前版本

git rebase -i HEAD~3  

```



![image-20210418091157558](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210418091157558.png)



上图执行的命令是git reset -i HEAD^3



当前分支为main，结点为c5  向上回退三个版本就是c3，所以c3到c5整体移动，然后通过可视化界面来调整c5和c4的顺序，最后就呈现出来的效果如上图所示



### git reset —hard HEAD^



刚才提交的commit觉得太烂了，不想修改了，直接放弃，就可以使用这个，退回到上一个commit就可以了



hard的意思是重置工作目录，意思就是直接将head新指向的commit的内容全部放置到当前目录，就是你之前没有提交的代码都被覆盖掉了



### git reset —soft HEAD^



切换到上一级的commit，将当前工作目录的改动保存到暂存区中，这也是与har的最大的区别



## revert



作用：撤销上一步的提交，并且将其推动到远程仓库



## cherry-pick



作用：将其他分支节点直接复制到当前分支的当前节点



## reflog



查看 Git 仓库中的引用的移动记录。如果不指定引用，它会显示 HEAD 的移动记录



当你误删一个branch的时候，看下branch所对应的



git reflog master 显示master的移动记录