---
title: bytemd使用（vue版本）
description: ""
tags:
  - 无标签
pubDate: 2021-07-16
---


bytemd使用



<!-- more -->



# 初步使用



首先是根据[bytemd](https://github.com/bytedance/bytemd)中md的教程来进行操作。我这里使用的是vue版本的。

> 首先你要创建或者有一个vue项目（我是新创建的vue项目）

## 结构了解

主要是分为编辑和查看两个页面        

- 编辑是Editor

- 查看是View

## 安装bytemd

```npm

npm install @bytemd/vue

```

## 新建一个test页面

```vue

<template>

  <Editor :value="value" :plugins="plugins" @change="handleChange" />

</template>



<script>

//这里就是引入所有的扩展的插件

import 'bytemd/dist/index.min.css'

import { Editor} from '@bytemd/vue'

import gfm from '@bytemd/plugin-gfm'

import highlight from "@bytemd/plugin-highlight-ssr";



const plugins = [

//将所有的扩展功能放入插件数组中，然后就可以生效了    

gfm(),

highlight(),

]



export default {

  name: "test",

components: { Editor },

data() {

return { value: '', plugins }

},

methods: {

handleChange(v) {

this.value = v

},

},

}

</script>

<style scoped>



</style>

```

## 修改APP页面



![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b1ddb524e434d7794afdcf0d5dfda91~tplv-k3u1fbpfcp-watermark.image)

## 启动项目

最后就是启动这个项目了



![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f1e3c1af5ed43b78ea76c319b1b799f~tplv-k3u1fbpfcp-watermark.image)

这只是简单的运行起来了，需要自己慢慢来摸索优化