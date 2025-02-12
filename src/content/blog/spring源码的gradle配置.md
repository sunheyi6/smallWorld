---
title: spring源码的gradle配置
description: 
tags:
  - 无标签
pubDate: 2021-04-26
---


主要是修改init.gradle文件配置



<!-- more -->



全部内容如下



```java

allprojects {

    repositories {

        maven { url "https://maven.aliyun.com/repository/public" }

        //有一个依赖，public中没有，所以需要spring

        maven { url "https://maven.aliyun.com/repository/spring" }

        maven {

            name "ALIYUN_CENTRAL_URL" // name 可以不需要

            url 'https://maven.aliyun.com/nexus/content/repositories/central'

        }

        maven {

            name "ALIYUN_JCENTER_URL"

            url 'https://maven.aliyun.com/nexus/content/repositories/jcenter'

        }

        maven {

            name "ALIYUN_GOOGLE_URL"

            url 'https://maven.aliyun.com/nexus/content/repositories/google'

        }

    }

}

```


