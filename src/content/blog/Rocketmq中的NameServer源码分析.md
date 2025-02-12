---
title: Rocketmq中的NameServer源码分析
description: ""
tags:
  - 无标签
pubDate: 2021-03-27
---


## 创建NamesrvController



<!-- more -->



> 我这里都是截取的部分代码，梳理大概逻辑，具体细节部分需要大家自行去阅读源码



### NamesrvStartup



```java

    public static NamesrvController main0(String[] args) {

        try {

            NamesrvController controller = createNamesrvController(args);

            start(controller);

        }

```



```java

public static NamesrvController start(final NamesrvController controller) throws Exception {

    boolean initResult = controller.initialize();

    controller.start();

    return controller;

}

```



```java

    public void start() throws Exception {

        //真正地启动nameserver，这个start的是调用了remotingServer接口的start

        this.remotingServer.start();

        if (this.fileWatchService != null) {

            this.fileWatchService.start();

        }

    }

```



### RemotingService



```java

public interface RemotingService {

    //这个start的实现类分两种，一个是客户端的，一个是服务端的，都是借助了netty来完成的

    void start();



    void shutdown();



    void registerRPCHook(RPCHook rpcHook);

}

```



## 初始化NameServerController



```java

public boolean initialize() {



    this.kvConfigManager.load();



    this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.brokerHousekeepingService);



    this.remotingExecutor =

        Executors.newFixedThreadPool(nettyServerConfig.getServerWorkerThreads(), new ThreadFactoryImpl("RemotingExecutorThread_"));



    this.registerProcessor();



    this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {

        //每隔10秒就要进行一次扫描，扫描出来所有已经掉线的broker，第一次延迟五秒

        @Override

        public void run() {

            NamesrvController.this.routeInfoManager.scanNotActiveBroker();

        }

    }, 5, 10, TimeUnit.SECONDS);



    this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {



        @Override

        public void run() {

            NamesrvController.this.kvConfigManager.printAllPeriodically();

        }

    }, 1, 10, TimeUnit.MINUTES);

    return true;

}

```



### RouteInfoManager



```java

//过期时间是两分钟

private final static long BROKER_CHANNEL_EXPIRED_TIME = 1000 * 60 * 2;

//扫描出所有已经掉线的broker

public void scanNotActiveBroker() {

    Iterator<Entry<String, BrokerLiveInfo>> it = this.brokerLiveTable.entrySet().iterator();

    while (it.hasNext()) {

        Entry<String, BrokerLiveInfo> next = it.next();

        long last = next.getValue().getLastUpdateTimestamp();

        if ((last + BROKER_CHANNEL_EXPIRED_TIME) < System.currentTimeMillis()) {

            RemotingUtil.closeChannel(next.getValue().getChannel());

            it.remove();

            log.warn("The broker channel expired, {} {}ms", next.getKey(), BROKER_CHANNEL_EXPIRED_TIME);

            this.onChannelDestroy(next.getKey(), next.getValue().getChannel());

        }

    }

}

```



## broker注册到nameserver



### NamesrvController



```java

    private void registerProcessor() {

        if (namesrvConfig.isClusterTest()) {



            this.remotingServer.registerDefaultProcessor(new ClusterTestRequestProcessor(this, namesrvConfig.getProductEnvName()),

                this.remotingExecutor);

        } else {

            //nameservier默认的请求注册进入了，都交给nettyserver来进行处理

            this.remotingServer.registerDefaultProcessor(new DefaultRequestProcessor(this), this.remotingExecutor);

        }

    }

```

### DefaultRequestProcessor

```java

        switch (request.getCode()) {

            case RequestCode.PUT_KV_CONFIG:

                return this.putKVConfig(ctx, request);

            case RequestCode.GET_KV_CONFIG:

                return this.getKVConfig(ctx, request);

            case RequestCode.DELETE_KV_CONFIG:

                return this.deleteKVConfig(ctx, request);

            case RequestCode.QUERY_DATA_VERSION:

                return queryBrokerTopicConfig(ctx, request);

                //将broker的请求注册到nameserver中

            case RequestCode.REGISTER_BROKER:

                Version brokerVersion = MQVersion.value2Version(request.getVersion());

                if (brokerVersion.ordinal() >= MQVersion.Version.V3_0_11.ordinal()) {

                    return this.registerBrokerWithFilterServer(ctx, request);

                } else {

                //注册broker到nameserver

                    return this.registerBroker(ctx, request);

                }

```



```java

//调用了namesrvController.getRouteInfoManager().registerBroker方法真正将broker注册到nameserver中了

        RegisterBrokerResult result = this.namesrvController.getRouteInfoManager().registerBroker(

            requestHeader.getClusterName(),

            requestHeader.getBrokerAddr(),

            requestHeader.getBrokerName(),

            requestHeader.getBrokerId(),

            requestHeader.getHaServerAddr(),

            topicConfigWrapper,

            null,

            ctx.channel()

        );

```



```java

    public RegisterBrokerResult registerBroker(

        final String clusterName,

        final String brokerAddr,

        final String brokerName,

        final long brokerId,

        final String haServerAddr,

        final TopicConfigSerializeWrapper topicConfigWrapper,

        final List<String> filterServerList,

        final Channel channel) {

        RegisterBrokerResult result = new RegisterBrokerResult();

        try {

            try {

            //加锁，同一时间只能有一个线程访问

                this.lock.writeLock().lockInterruptibly();

//根据clusterName获取到了一个set，之后每隔30秒发送的请求是没有影响的，set会自动去重的

                Set<String> brokerNames = this.clusterAddrTable.get(clusterName);

                if (null == brokerNames) {

                    brokerNames = new HashSet<String>();

                    this.clusterAddrTable.put(clusterName, brokerNames);

                }

                //将broker添加到一个集群里面

                brokerNames.add(brokerName);



                boolean registerFirst = false;

//根据brokername获取到brokerdata

//brokerAddrTable存放了所有broker的详细路由信息

                BrokerData brokerData = this.brokerAddrTable.get(brokerName);

                //如果broker第第一次进行注册，brokerDate会是null，会new一个BrokerData，将路由信息放入brokerAddrTable中

                if (null == brokerData) {

                    registerFirst = true;

                    brokerData = new BrokerData(clusterName, brokerName, new HashMap<Long, String>());

                    this.brokerAddrTable.put(brokerName, brokerData);

                }

                Map<Long, String> brokerAddrsMap = brokerData.getBrokerAddrs();

                //Switch slave to master: first remove <1, IP:PORT> in namesrv, then add <0, IP:PORT>

                //The same IP:PORT must only have one record in brokerAddrTable

                Iterator<Entry<Long, String>> it = brokerAddrsMap.entrySet().iterator();

                while (it.hasNext()) {

                    Entry<Long, String> item = it.next();

                    if (null != brokerAddr && brokerAddr.equals(item.getValue()) && brokerId != item.getKey()) {

                        it.remove();

                    }

                }



                String oldAddr = brokerData.getBrokerAddrs().put(brokerId, brokerAddr);

                registerFirst = registerFirst || (null == oldAddr);



                if (null != topicConfigWrapper

                    && MixAll.MASTER_ID == brokerId) {

                    if (this.isBrokerTopicConfigChanged(brokerAddr, topicConfigWrapper.getDataVersion())

                        || registerFirst) {

                        ConcurrentMap<String, TopicConfig> tcTable =

                            topicConfigWrapper.getTopicConfigTable();

                        if (tcTable != null) {

                            for (Map.Entry<String, TopicConfig> entry : tcTable.entrySet()) {

                                this.createAndUpdateQueueData(brokerName, entry.getValue());

                            }

                        }

                    }

                }

//这里是broker心跳的核心处理逻辑

//默认每隔30秒就会有一个新的BrokerLiveInfo被put到brokerLiveTable，覆盖上一次的心跳时间

//BrokerLiveInfo里面的这个 System.currentTimeMillis(),当前时间戳就是broker最新的心跳时间

                BrokerLiveInfo prevBrokerLiveInfo = this.brokerLiveTable.put(brokerAddr,

                    new BrokerLiveInfo(

                        System.currentTimeMillis(),

                        topicConfigWrapper.getDataVersion(),

                        channel,

                        haServerAddr));

                if (null == prevBrokerLiveInfo) {

                    log.info("new broker registered, {} HAServer: {}", brokerAddr, haServerAddr);

                }



                if (filterServerList != null) {

                    if (filterServerList.isEmpty()) {

                        this.filterServerTable.remove(brokerAddr);

                    } else {

                        this.filterServerTable.put(brokerAddr, filterServerList);

                    }

                }



                if (MixAll.MASTER_ID != brokerId) {

                    String masterAddr = brokerData.getBrokerAddrs().get(MixAll.MASTER_ID);

                    if (masterAddr != null) {

                        BrokerLiveInfo brokerLiveInfo = this.brokerLiveTable.get(masterAddr);

                        if (brokerLiveInfo != null) {

                            result.setHaServerAddr(brokerLiveInfo.getHaServerAddr());

                            result.setMasterAddr(masterAddr);

                        }

                    }

                }

            } finally {

                this.lock.writeLock().unlock();

            }

        } catch (Exception e) {

            log.error("registerBroker Exception", e);

        }



        return result;

    }

```