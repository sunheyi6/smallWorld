---
title: Spring注解
description: ""
tags:
  - 无标签
pubDate: 2021-05-10
---


深入理解spring注解的构成



<!-- more -->



## 自定义注解



```java

public @interface zhujie {

}

```



其实最简单注解就是这样的，直接使用@interface后面跟上你想自定义的注解的名字即可



当然了，有一些本身在注解上常用的注解，下面一一来介绍。



## 原生注解



### @target



```java

@Documented

@Retention(RetentionPolicy.RUNTIME)

@Target(ElementType.ANNOTATION_TYPE)

public @interface Target {

    /**

     * Returns an array of the kinds of elements an annotation type

     * can be applied to.

     * @return an array of the kinds of elements an annotation type

     * can be applied to

     */

    ElementType[] value();

}

```



elementpye



```java

public enum ElementType {

    /** Class, interface (including annotation type), or enum declaration */

    //类，接口或者枚举类

    TYPE,



    /** Field declaration (includes enum constants) */

    //变量声明

    FIELD,



    /** Method declaration */

    //方法声明

    METHOD,



    /** Formal parameter declaration */

    //格式化声明

    PARAMETER,



    /** Constructor declaration */

    //构造声明

    CONSTRUCTOR,



    /** Local variable declaration */

    //本地变量声明

    LOCAL_VARIABLE,



    /** Annotation type declaration */

    //注解类型声明

    ANNOTATION_TYPE,



    /** Package declaration */

    //打包

    PACKAGE,



    /**

     * Type parameter declaration

     *

     * @since 1.8

     */

    TYPE_PARAMETER,



    /**

     * Use of a type

     *

     * @since 1.8

     */

    //用户类型

    TYPE_USE

}

```



### @Retention



```java

@Documented

@Retention(RetentionPolicy.RUNTIME)

@Target(ElementType.ANNOTATION_TYPE)

public @interface Retention {

    /**

     * Returns the retention policy.

     * @return the retention policy

     */

    RetentionPolicy value();

}

```



```java

public enum RetentionPolicy {

    /**

     * Annotations are to be discarded by the compiler.

     * 批注将被编译器丢弃

     */

    SOURCE,



    /**

     * Annotations are to be recorded in the class file by the compiler

     * but need not be retained by the VM at run time.  This is the default

     * behavior.

     *注释将由编译器记录在类文件中，但VM不必在运行时保留它们。 这是默认行为。

     */

    //

    CLASS,



    /**

     * Annotations are to be recorded in the class file by the compiler and

     * retained by the VM at run time, so they may be read reflectively.

     *注释将由编译器记录在类文件中，并在运行时由VM保留，因此可以通过反射方式读取它们。

     * @see java.lang.reflect.AnnotatedElement

     */

    RUNTIME

}

```



### @Documented



```java

@Documented

@Retention(RetentionPolicy.RUNTIME)

@Target(ElementType.ANNOTATION_TYPE)

public @interface Documented {

}

```