---
title: java继承
description: ""
tags:
  - 无标签
pubDate: 2021-05-05
---


彻底搞懂java的父类与子类的关系



<!-- more -->



## 缘由



java出现继承的原因其实很简单，就是为了代码复用，减少编写很多无用的代码



## 单继承



众所周知，java是单继承的，为什么那？



主要是因为如果a继承了b和c的方法，但是b和c中有同名的方法，那就无法确定到底是调用的是哪个父类的方法



## 注意事项



>- 除了object类，一个类只有一个父类，并且在没有明确声明继承与哪个类的时候，默认继承object类

>- 子类无法访问父类的`private`字段或者`private`方法

>- 子类*不会继承*任何父类的构造方法。子类默认的构造方法是编译器自动生成的，不是继承的。

>- 如果父类没有默认的构造方法，子类就必须显式调用`super()`并给出参数以便让编译器定位到父类的一个合适的构造方法，否则就会报错

>- 正常情况下，只要某个class没有`final`修饰符，那么任何类都可以从该class继承。

>- 推荐使用向上转型，使用向下转型的时候，可能会报错，推荐使用instanceof 判断之后再进行向下转型

>- java中静态属性和静态方法可以被继承，但是没有被重写(overwrite)而是被隐藏。



## 初始化顺序



1. 父类静态成员和静态初始化快，按在代码中出现的顺序依次执行。

2. 子类静态成员和静态初始化块，按在代码中出现的顺序依次执行。



3. 父类的实例成员和实例初始化块，按在代码中出现的顺序依次执行。

4. 执行父类的构造方法。

5. 子类实例成员和实例初始化块，按在代码中出现的顺序依次执行。

6. 执行子类的构造方法。



## 测试



```java

package test;



public class demo02 {

    public static void main(String[] args) {

        Father a = new Father();

        Chilren b = new Chilren();

        Father c = new Chilren();

        a.getAge();

        System.out.println(a.age);

        b.getAge();

        System.out.println(b.age);

        c.getAge();

        System.out.println(c.age);

    }

}



class Father {

    int age = 40;



    public void getAge() {

        System.out.println(age);

    }

}



class Chilren extends Father {

    int age = 18;



    public void getAge() {

        System.out.println(age);

    }

}

```



上面这段代码的输出结果是：



40 40 18 18 18 40



重点看倒数第二个结果，也就是 Father c = new Chilren();



从上面程序的运行结果可以看出



- **访问变量看声明，访问方法看实际对象类型（new出来的类型）**，也就是说如果你使用的声明是new出来的这个类的父类，那么这个实例对象的变量使用的是父类的变量，方法是使用的子类的方法，如果要是使用父类的方法需要使用super关键字

- **在实例化一个子类的同时，系统会给子类所有实例变量分配内存，也会给他的父类的实例变量分配内存，及时父子类中存在重名的实例变量，也会两个都分配内存的，这个时候子类只是隐藏了父类的这个变量，但还是会给它分配内存，然后可以用super来访问属于父类的变量。**



>   **this：是一个真真实实对象，代表的就是当前对象，可以用 return this;  去返回一个对象。**

>

>   **super：不能一个对象，不是指向父类对象的意思，super只是修饰了他后边的内容，告诉JVM，后面这部分内容不是当前对象所属类的内容而已，若用return super，JVM是不允许的，是一种错误的语法.**



  