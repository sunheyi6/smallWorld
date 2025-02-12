---
title: SpringBoot自动装配
description: 
tags:
  - 无标签
pubDate: 2021-05-13
---


自动装配原理介绍



<!-- more -->



## 启动类注解



众所周知，这是springboot的启动类的注解



```java

@SpringBootApplication

public class DemoApplication {



    public static void main(String[] args) {

        SpringApplication.run(DemoApplication.class, args);

    }



}

```



## @SpringBootApplication



```java

@Target(ElementType.TYPE)

@Retention(RetentionPolicy.RUNTIME)

@Documented

@Inherited

@SpringBootConfiguration

@EnableAutoConfiguration

@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),

      @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })

public @interface SpringBootApplication {

}

```



大概可以把 `@SpringBootApplication`看作是 `@Configuration`、`@EnableAutoConfiguration`、`@ComponentScan` 注解的集合。根据 SpringBoot 官网，这三个注解的作用分别是：



- `@EnableAutoConfiguration`：启用 SpringBoot 的自动配置机制



- `@Configuration`：允许在上下文中注册额外的 bean 或导入其他配置类



- `@ComponentScan`： 扫描被`@Component` (`@Service`,`@Controller`)注解的 bean，注解默认会扫描启动类所在的包下所有的类 ，可以自定义不扫描某些 bean。如下图所示，容器中将排除`TypeExcludeFilter`和`AutoConfigurationExcludeFilter`。



  @EnableAutoConfiguration` 是实现自动装配的重要注解，我们以这个注解入手。



## @EnableAutoConfiguration



```java

@Target({ElementType.TYPE})

@Retention(RetentionPolicy.RUNTIME)

@Documented

@Inherited

@AutoConfigurationPackage//将main包下的所欲组件注册到容器中

@Import({AutoConfigurationImportSelector.class})//加载自动装配类 xxxAutoconfiguration

public @interface EnableAutoConfiguration {

    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";



    Class<?>[] exclude() default {};



    String[] excludeName() default {};

}

```



这个注解最重要的就是    AutoConfigurationImportSelector这个类了



### AutoConfigurationImportSelector



AutoConfigurationImportSelector中重要的方法就是这个，主要负责加载自动配置类的。



```java

protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {

   if (!isEnabled(annotationMetadata)) {

      return EMPTY_ENTRY;

   }

   //默认情况下返回的是@EnableAutoConfiguration中的两个属性

   AnnotationAttributes attributes = getAttributes(annotationMetadata);

   List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);

   configurations = removeDuplicates(configurations);

   Set<String> exclusions = getExclusions(annotationMetadata, attributes);

   checkExcludedClasses(configurations, exclusions);

   configurations.removeAll(exclusions);

   configurations = getConfigurationClassFilter().filter(configurations);

   fireAutoConfigurationImportEvents(configurations, exclusions);

   return new AutoConfigurationEntry(configurations, exclusions);

}

```



#### getAttributes



这个方法返回了@EnableAutoConfiguration中的两个属性



![image-20210514093032660](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210514093032660.png)



#### getCandidateConfigurations



```java

//返回应考虑的自动配置类名称。 默认情况下，此方法将使用SpringFactoriesLoader和getSpringFactoriesLoaderFactoryClass()来加载候选SpringFactoriesLoader 。

protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes) {

   List<String> configurations = SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(),

         getBeanClassLoader());

   Assert.notEmpty(configurations, "No auto configuration classes found in META-INF/spring.factories. If you "

         + "are using a custom packaging, make sure that file is correct.");

   return configurations;

}

```



#### filter



这个方法主要是扫描到所有的



![image-20210514093526289](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210514093526289.png)



去除一些



![image-20210514094139509](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210514094139509.png)