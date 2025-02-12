---
title: Spring之IOC
description: 
tags:
  - 无标签
pubDate: 2021-05-02
---


详细介绍Spring的IOC



 <!-- more -->



## IOC



beans和context两个包是IOC的基础，BeanFactory接口提供了管理bean的机制，而 ApplicationContext是BeanFactory的一个子接口，它增加了AOP的整合，资源国际化，事件发布，以及应用层的context，比如WebApplicationContext。



简单点的说，BeanFactory提供了配置框架和基本功能，ApplicationContext增加了企业开发需要的特性，Spring的IOC容器一般也就是指ApplicationContext。



### Bean



bean的标识符必须唯一，一般情况下只有一个标识符，但可以有多个名称



在xml配置中，id, name 都是指的标识符，bean可以定义多个名称，在name属性中指定(逗号，分号或者空格分隔多个别名)



> 如果一个bean没有定义ID，则将会以它的simple name作为名字(首字母小写，如果多个大写字母开头，则保持原样)



```xml

<alias name="fromName" alias="toName"/>

```



sdlkfj 











### 容器的启动流程



```java

@Override

public void refresh() throws BeansException, IllegalStateException {

   synchronized (this.startupShutdownMonitor) {

      // Prepare this context for refreshing.

      prepareRefresh();



      // Tell the subclass to refresh the internal bean factory.

      ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();



      // Prepare the bean factory for use in this context.

      prepareBeanFactory(beanFactory);



      try {

         // Allows post-processing of the bean factory in context subclasses.

         postProcessBeanFactory(beanFactory);



         // Invoke factory processors registered as beans in the context.

         invokeBeanFactoryPostProcessors(beanFactory);



         // Register bean processors that intercept bean creation.

         registerBeanPostProcessors(beanFactory);



         // Initialize message source for this context.

         initMessageSource();



         // Initialize event multicaster for this context.

         initApplicationEventMulticaster();



         // Initialize other special beans in specific context subclasses.

         onRefresh();



         // Check for listener beans and register them.

         registerListeners();



         // Instantiate all remaining (non-lazy-init) singletons.

         finishBeanFactoryInitialization(beanFactory);



         // Last step: publish corresponding event.

         finishRefresh();

      }



      catch (BeansException ex) {

         if (logger.isWarnEnabled()) {

            logger.warn("Exception encountered during context initialization - " +

                  "cancelling refresh attempt: " + ex);

         }



         // Destroy already created singletons to avoid dangling resources.

         destroyBeans();



         // Reset 'active' flag.

         cancelRefresh(ex);



         // Propagate exception to caller.

         throw ex;

      }



      finally {

         // Reset common introspection caches in Spring's core, since we

         // might not ever need metadata for singleton beans anymore...

         resetCommonCaches();

      }

   }

}

```



### 加载过程



加载过程分为三个步骤



1. 资源定位

2. 解析DefaultBeanDefinitionDocumentReader

3. 注册



##### 资源定位



![image-20210503072417867](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210503072417867.png)



就如上图所示，一直是在调用父类的方法，直到ResourceLoader，这个类中有个getResource方法，可以将外部的资源，读取为Resource类。



##### 解析







##### 注册


