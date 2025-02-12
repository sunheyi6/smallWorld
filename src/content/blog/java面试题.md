---
title: java面试题
description: 
tags:
  - 无标签
pubDate: 2021-04-29
---


常见的java面试题总结



<!-- more -->



### 八大基础类型



整形： byte short int long



浮点型： float double



布尔型： boolen



字符型： char



### **访问修饰符**区别



![image-20210429204220549](C:\Users\10618\AppData\Roaming\Typora\typora-user-images\image-20210429204220549.png)



### 类型转换



#### **float f=3.4;是否正确？**



答:不正确。3.4是双精度数，将双精度型（double）赋值给浮点型（float）属于下转型（down-casting，也称为窄化）会造成精度损失，因此需要强制类型转换float f =(float)3.4; 或者写成float f =3.4F;。



#### **short s1 = 1; s1 = s1 + 1;有错吗?short s1 = 1; s1 += 1;有错吗？**



对于short s1 = 1; s1 = s1 + 1;由于1是int类型，因此s1+1运算结果也是int 型，需要强制转换类型才能赋值给short型。而short s1 = 1; s1 += 1;可以正确编译，因为s1+= 1;相当于s1 = (short)(s1 + 1);其中有隐含的强制类型转换。






