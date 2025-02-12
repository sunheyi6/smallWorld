---
title: hexo next 圆角边框
description: ""
tags:
  - 无标签
pubDate: 2023-05-29
---


简单设置就可以了



<!-- more -->



> 以前的那种在source/_datavariables.styl文件中修改的不管用了 只能自己来了



## 主题设置



```yaml

custom_file_path:

  style: source/_data/styles.styl

```



主要是styles这个文件启用就好了



## styles.styl



```yaml

.fadeIn{

      border-radius:20px;  /* 矩形有圆角 */

}

```



> 其实很快就搞出来，直接f12 试试就行了
