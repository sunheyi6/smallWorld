---
title: hexo部署到github两种方式对比
description: ""
tags:
  - 无标签
pubDate: 2023-11-24
---
有两种方式，一种是使用私钥公钥的方式，另一种是使用token的方式来进行的



## 对比



私钥公钥的方式比较麻烦，就是你每更换一个电脑，都需要将自己 ssh 链接github的私钥保存在actions的那个 变量里面，而token的方式就是设置一次即可，下次换个电脑只要保证自己可以连接到github上就可以了



> 下面只演示token的方式是如何进行的



## token



在hexo源代码仓库新建一个github action，内容如下



```yaml

name: 自动部署

# 当有改动推送到master分支时，启动Action

on:

  push:

    branches:

      - master

      #2020年10月后github新建仓库默认分支改为main，注意更改

permissions:

  contents: write

jobs:

  deploy:

    runs-on: ubuntu-latest

    steps:

      - name: 检查分支

        uses: actions/checkout@v2

        with:

          ref: master



      - name: 安装 Node

        uses: actions/setup-node@v1

        with:

          node-version: "16.x"



      - name: 安装 Hexo

        run: |

          export TZ='Asia/Shanghai'

          npm install hexo-cli -g



      - name: 缓存 Hexo

        id: cache-npm

        uses: actions/cache@v3

        env:

          cache-name: cache-node-modules

        with:

          path: node_modules

          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}

          restore-keys: |

            ${{ runner.os }}-build-${{ env.cache-name }}-

            ${{ runner.os }}-build-

            ${{ runner.os }}-



      - name: 安装依赖

        if: ${{ steps.cache-npm.outputs.cache-hit != 'true' }}

        run: |

          npm install --save

      - name: Setup Git Infomation

        run: | 

          git config --global user.name 'sunheyi' 

          git config --global user.email '1061867552@qq.com'

      - name: 生成静态文件

        run: |

          hexo clean

          hexo bangumi -u #bilibili番剧更新

          hexo generate



      - name: 部署到Github

        uses: JamesIves/github-pages-deploy-action@v4

        with:

          token: 你的token 记得将这个仓库改为私有仓库，当然你也可以设置为仓库然后用sercret.token的方式来引用它

          repository-name: sunheyi6/sunheyi6.github.io

          branch: main

          folder: public

          commit-message: "${{ github.event.head_commit.message }} Updated By Github Actions"

```



> 这里需要注意的是，当你都完成了 代码也推送到github page的时候，你需要去vercel或者你选定的一个厂商中将github page这个仓库部署起来就可以了，否则这个页面一直显示都是空白页面！！！  部署之后需要改这个域名为你自己想要设置的域名，如下图

>

> ![image-20231127093602904](https://shyblog.oss-cn-beijing.aliyuncs.com/img/image-20231127093602904.png)

>

> 我因为这个问题搞了一天，哎!