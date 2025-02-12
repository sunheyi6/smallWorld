---
title: vagrant使用
description: 
tags:
  - 无标签
pubDate: 2021-03-22
---


简单介绍使用



## 具体步骤



1. 从这个地址下载centos7



   https://github.com/tommy-muehle/puppet-vagrant-boxes/releases/download/1.1.0/centos-7.0-x86_64.box



2. cmd，运行以下命令



   ```bash

   #CentOs7是自定义的名字

   #E:/config/centos-7.0-x86_64.box是下载到本地的地址

   vagrant box add CentOs7 E:/config/centos-7.0-x86_64.box

   

   ```



   ![image-20200425192221398](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20200425192105128.png)



3. 运行以下命令



   ```bash

   #CentOs7是上面自定义的名字

   vagrant init CentOs7

   ```



   ![image-20200425192221398](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20201107180724201.png)



>注意：如果你之间已经执行过vagrant init这个命令，会报错，需要把相应的文件删除即可，一般文件会在你操作的目录下，我的是C:\Users\lenovo，删除这个Vagrantfile，再次执行vagrant init CentOs7即可



4. 至此，已经安装成功，直接vagrant up启动即可



5. 打开xshell输入相应信息



   ```bash

   127.0.0.1

   root vagrant

   端口：2222

   ```



   



6. 使用xshell连接即可



> 若是要多个虚拟机做集群，需要在第4部之前修改Vagrantfile,然后下面vagrant up就可以了，下面是我的Vagrantfile配置，是三个虚拟机



```bash

Vagrant.configure("2") do |config|

  

  config.vm.define "vagrant1" do |vb|

      config.vm.provider "virtualbox" do |v|

      v.memory = 1024

      v.cpus = 1

    end

  vb.vm.host_name = "vagrant1"

  vb.vm.network :public_network, ip: "192.168.1.21"

  vb.vm.box = "Centos7"

  end



  config.vm.define "vagrant2" do |vb|

      config.vm.provider "virtualbox" do |v|

      v.memory = 1024

      v.cpus = 1

    end

  vb.vm.host_name = "vagrant2"

  vb.vm.network :public_network, ip: "192.168.1.22"

  vb.vm.box = "Centos7"

  end



  config.vm.define "vagrant3" do |vb|

      config.vm.provider "virtualbox" do |v|

      v.memory = 1024

      v.cpus = 1

    end

  vb.vm.host_name = "vagrant3"

  vb.vm.network :public_network, ip: "192.168.1.23"

  vb.vm.box = "Centos7"

  end



end

```



账号是root 密码是 vagrant



端口号每个不一样，非常好辨认



![image-20201107180724201](https://gitee.com/flow_disaster/blog-map-bed/raw/master/img/image-20200425192221398.png)



## vagrant常用命令



```bash

#初始化配置；

vagrant init

#启动全部虚拟机；

vagrant up：

#启动单个虚拟机

vagrant up 虚拟机名字

#登录虚拟机；

vagrant ssh：

#挂起虚拟机；

vagrant suspend：

#：重启虚拟机；

vagrant reload

#关闭虚拟机；

vagrant halt：

#查看虚拟机状态；

vagrant status：

#删除虚拟机。

vagrant destroy：

```


