---
title: astro添加谷歌分析
description: ""
tags:
  - 无标签
pubDate: 2024-07-04
---
## 安装partytown

```shell

pnpm install @astrojs/partytown

```

## 启用partytown,在astro.config.ts文件下添加下列文件

```ts

import partytown from '@astrojs/partytown'



export default defineConfig({

  integrations: [

      partytown({

			config: {

			  forward: ["dataLayer.push"],

			},

		}),

  ]

});

```

## header.astro文件添加谷歌分析代码

```javascript

<!-- Google tag (gtag.js) -->

<script type="text/partytown" async src="https://www.googletagmanager.com/gtag/js?id=G-MZXCQSZ8FT"></script>

<script type="text/partytown">

  window.dataLayer = window.dataLayer || [];

  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());



  gtag('config', '你的谷歌代码');

</script>

```

## 测试是否成功

在谷歌分析中这个页面可以进行测试的

![](https://shyblog.oss-cn-beijing.aliyuncs.com/img/PixPin_2024-07-04_12-05-28.png)
