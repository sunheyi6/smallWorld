---
title: 解决hexo更新时间问题
description: ""
tags:
  - 无标签
pubDate: 2023-05-29
---


## 修改post文件



```shell

---title: {{ title }}

pubDateTime: {{ pubDateTime }}

updated: {{ pubDateTime }}

tags:

```



这样每次新建文章后，会自动添加 `updated` 标签，并且与 `pubDateTime` 的创建时间一致。



如果是历史文章，则需要**手动给每篇文章增加这个更新时间**，或者自己写个脚本批量处理下。



## 主题相关配置



![image-20230529105049252](https://shyblog.oss-cn-beijing.aliyuncs.com/img/image-20230529105049252.png)



## 参考



- [网址](https://sqiang.net/post/2792803495.html)
