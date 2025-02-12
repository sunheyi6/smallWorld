---
title: java_String
description: 
tags:
  - 无标签
pubDate: 2021-04-29
---


string类型的介绍



<!-- more -->



# string



## 不可变性



```java

//由于是final，所以string是不可继承的

public final class String

//final修饰的char[]代表了被存储的数据不可更改性

//是final和private

private final char value[];

//下面这个例子说明，是final和private一起来使得String的数据是不可改变的

final  int[] array={1,2,3,4};

array[2]=100;

System.out.println(array[2]);

```



### 原因



1. 只有String是不可改变的，字符串池才有可能实现

2. 如果字符串是可变的，会引发线程安全的问题



## 长度限制



由于stirng其实就是一个char数组



char数组的下标是整型，integer



https://segmentfault.com/a/1190000020381075



## 三种常量池区分



### 全局常量池



全局字符串池里的内容是在类加载完成，经过验证，准备阶段之后在堆中生成字符串对象实例，然后将该字符串对象实例的引用值存到string pool中（**记住：string pool中存的是引用值而不是具体的实例对象，具体的实例对象是在堆中开辟的一块空间存放的。**）。 在HotSpot VM里实现的string pool功能的是一个StringTable类，它是一个哈希表，里面存的是驻留字符串(也就是我们常说的用双引号括起来的)的引用（而不是驻留字符串实例本身），也就是说在堆中的某些字符串实例被这个StringTable引用之后就等同被赋予了”驻留字符串”的身份。这个StringTable在每个HotSpot VM的实例只有一份，被所有的类共享。



### class文件常量池



我们都知道，class文件中除了包含类的版本、字段、方法、接口等描述信息外，还有一项信息就是常量池(constant pool table)，用于存放编译器生成的**各种字面量(Literal)和符号引用(Symbolic References)**。 字面量就是我们所说的常量概念，如文本字符串、被声明为final的常量值等。 符号引用是一组符号来描述所引用的目标，符号可以是任何形式的字面量，只要使用时能无歧义地定位到目标即可（它与直接引用区分一下，直接引用一般是指向方法区的本地指针，相对偏移量或是一个能间接定位到目标的句柄）。一般包括下面三类常量：



- 类和接口的全限定名

- 字段的名称和描述符

- 方法的名称和描述符



### 运行时常量池



当java文件被编译成class文件之后，也就是会生成我上面所说的class常量池，那么运行时常量池又是什么时候产生的呢？



jvm在执行某个类的时候，必须经过**加载、连接、初始化**，而连接又包括验证、准备、解析三个阶段。而当类加载到内存中后，jvm就会将class常量池中的内容存放到运行时常量池中，由此可知，运行时常量池也是每个类都有一个。在上面我也说了，class常量池中存的是字面量和符号引用，也就是说他们存的并不是对象的实例，而是对象的符号引用值。而经过解析（resolve）之后，也就是把符号引用替换为直接引用，解析的过程会去查询全局字符串池，也就是我们上面所说的StringTable，以保证运行时常量池所引用的字符串与全局字符串池中所引用的是一致的。



### 总结



1.全局常量池在每个VM中只有一份，存放的是字符串常量的引用值。



2.class常量池是在编译的时候每个class都有的，在编译阶段，存放的是常量的符号引用。



3.运行时常量池是在类加载完成之后，将每个class常量池中的符号引用值转存到运行时常量池中，也就是说，每个class都有一个运行时常量池，类在解析之后，将符号引用替换成直接引用，与全局常量池中的引用值保持一致。



## substring



https://www.hollischuang.com/archives/1232



jdk6和jdk7之后的差别



### jdk6



jdk6的时候，当截取字符串的时候，会在堆中new 一个新的string对象，但是这个string对象使用的char数组还是之前的数组，如果你只是在很长的字符串中引用了很小的一块数据，但是由于这个char数组是有引用的，所以无法进行垃圾回收，但是由于你所使用的字符串只是很小的一部分，但是你却用了这么大的char数组，会导致好像那么一大空间不存在似的，这就产生了内存泄露的问题。



内存泄露：在计算机科学中，内存泄漏指由于疏忽或错误造成程序未能释放已经不再使用的内存。 内存泄漏并非指内存在物理上的消失，而是应用程序分配某段内存后，由于设计错误，导致在释放该段内存之前就失去了对该段内存的控制，从而造成了内存的浪费。



### jdk7



既然已经知道了上述问题所在，那么只需要new一个新的string的时候，让这个string指向自己的包含的char数组即可



```java

        public String(char value[], int offset, int count) {

        if (offset < 0) {

            throw new StringIndexOutOfBoundsException(offset);

        }

        if (count <= 0) {

            if (count < 0) {

                throw new StringIndexOutOfBoundsException(count);

            }

            if (offset <= value.length) {

                this.value = "".value;

                return;

            }

        }

        // Note: offset or count might be near -1>>>1.

        if (offset > value.length - count) {

            throw new StringIndexOutOfBoundsException(offset + count);

        }

        //就是在这里将char数组拷贝过来，截取的offset和截取字符串的值是一样的

        this.value = Arrays.copyOfRange(value, offset, offset+count);

    }

```



## replaceFirst、replaceAll、replace区别



```java

    public String replaceFirst(String regex, String replacement) {

        return Pattern.compile(regex).matcher(this).replaceFirst(replacement);

    }

        public String replaceAll(String regex, String replacement) {

        return Pattern.compile(regex).matcher(this).replaceAll(replacement);

    } 

        public String replace(CharSequence target, CharSequence replacement) {

        return Pattern.compile(target.toString(), Pattern.LITERAL).matcher(

                this).replaceAll(Matcher.quoteReplacement(replacement.toString()));

    } 

```



replaceFirst的作用是让regex去replacement替换原有string的第一个字符



replaceAll的作用是replacement替换regex



replace的作用是将原有字符串的所有target替换为repalcement



## String、StringBuilder和StingBuffer之间的区别与联系



### StringBuilder



```java

    public StringBuilder() {

        super(16);

    }



    public StringBuilder(int capacity) {

        super(capacity);

    }

     public StringBuilder(String str) {

        super(str.length() + 16);

        append(str);

    }

        @Override

    public StringBuilder append(Object obj) {

        return append(String.valueOf(obj));

    }



    @Override

    public StringBuilder append(String str) {

        super.append(str);

        return this;

    } 

```



从源码可以看出，默认的stringbuilder是16个字节，如果指定了大小就用指定的大小，如果直接给了个参数就是字符串的长度加上16个字节



方法中没有synchronized，所以这是线程不安全的



### StingBuffer



```java

    @Override

    public synchronized int length() {

        return count;

    }



    @Override

    public synchronized int capacity() {

        return value.length;

    }





    @Override

    public synchronized void ensureCapacity(int minimumCapacity) {

        super.ensureCapacity(minimumCapacity);

    }

```



方法都是synchronized修饰的，所以是线程安全的



## String对“+”的重载



https://juejin.im/post/6844903960608784392



```java

package com.test;



public class demo {

    public static void main(String[] args) {

        String a = "1";

        String b = "2";

        System.out.println(a+b);

    }

}

```



![image-20210429215615889](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210429215615889.png)



从反编译的过程可以看出，是调用了stringbuilder的append方法，



## String.valueOf和Integer.toString的区别



stirng



```java

        //stirng不能为null，为null会报NullPointerException

        public String toString() {

        return this;

    }

    //这个方法的功能就是如果形参是null，那么返回null字符串，而不是直接报NullPointerException异常

    public static String valueOf(Object obj) {

        return (obj == null) ? "null" : obj.toString();

    }

```



integer



```java

    public static String toString(int i, int radix) {

        if (radix < Character.MIN_RADIX || radix > Character.MAX_RADIX)

            radix = 10;



        /* Use the faster version */

        if (radix == 10) {

            return toString(i);

        }



        char buf[] = new char[33];

        boolean negative = (i < 0);

        int charPos = 32;



        if (!negative) {

            i = -i;

        }



        while (i <= -radix) {

            buf[charPos--] = digits[-(i % radix)];

            i = i / radix;

        }

        buf[charPos] = digits[-i];



        if (negative) {

            buf[--charPos] = '-';

        }



        return new String(buf, charPos, (33 - charPos));

    }

```



## switch对String的支持



```java

package com.test;







public class demo {

    public static void main(String[] args) {

        String str = "world";

        switch (str) {

            case "hello":

                System.out.println("hello");

                break;

            case "world":

                System.out.println("world");

                break;

            default:

                break;

        }



    }

}

```



反编译



![image-20210429215539166](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20210429215539166.png)



由反编译的代码可以看出来，switch中的case是通过hashCode来进行匹配的，使用equals方法来进行值的比较



## 字符串池



## intern



[美团对于这个关键字的分析](https://tech.meituan.com/2014/03/06/in-depth-understanding-string-intern.html)



## **String比较特别的地方**



1. 直接中双引号引起来的，是放在常量池中，如代码所示String s2="1";

2. 如果不是用双引号声明的String对象，可以使用String提供的intern方法。intern 方法会从字符串常量池中查询当前字符串是否存在，若不存在就会将当前字符串放入常量池中



实际例子验证：



```java

package com.test;



public class demo02 {

    public static void main(String[] args) {

        String s="1";

        String s1=new String("1");

        String s2=s.intern();

        System.out.println(s==s1);

        System.out.println(s1==s2);

        System.out.println(s2==s);

    }

}

```



运行结果：false false true



jdk7之后，intern方法对 intern 操作和常量池都做了一定的修改。主要包括2点：



1. 将String常量池 从 Perm 区移动到了 Java Heap区

2. String#intern 方法时，如果存在堆中的对象，会直接保存对象的引用，而不会重新创建对象。



由上图代码及运行结果可以看出，双引号的的String是直接在常量池中的，而new出来的对象是在堆中的，当s2调用intern的方法之后，会去常量池中查找是否有这变量，如果有的话会直接引用常量池中的对象



## 转换为String的三种方式



- (string)

- toString

- String.valueOf()



[三种方式的区别](https://blog.csdn.net/itmyhome1990/article/details/77879653)



推荐使用 String.valueOf()的方法，这个方法可以避免强转时候对象不能转换为String的错误，也可以避免toString的时候对象为null的情况
