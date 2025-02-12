---
title: hexo自动获取图片主色
description: ""
tags:
  - 无标签
pubDate: 2023-12-07
---


## 缘由



不知道为什么，我在使用阿里云图片的时候，识别文章主色总是很慢，于是就觉得能不能生成文章的时候就直接确定主色，于是就有这个文件



## 代码



我的hexo souce文件是位于:



D:\blog\blogSourceCode\



这个新建文件是位于主题内这个目录下的:



D:\blog\blogSourceCode\themes\anzhiyu\scripts



文件名为 getTopImageColor.js



```js

// 自动设置文章的 ogImage 和 main_color 两个字段

const fs = require("fs");

const path = require("path");

const axios = require("axios");

const yaml = require("js-yaml");

const https = require("https"); // Make sure to import this module

const { type } = require("os");



const POSTS_DIR = process.cwd() + "/source/_posts";

const RANDOM_IMG = "https://random-img.pupper.cn";



// Define httpsAgent right after your imports and before the function calls

const httpsAgent = new https.Agent({

  rejectUnauthorized: false,

});



async function getCoverImage() {

  try {

    const response = await axios.get(RANDOM_IMG, {

      maxRedirects: 0,

      validateStatus: (status) => status === 302,

      httpsAgent, // Use the agent here

    });

    return response.headers.location;

  } catch (error) {

    console.error("Error fetching ogImage image:", error);

  }

}



async function getMainColor(url) {

  try {

    const urlSuffix = "?imageAve";

    const aliyun = "aliyun";

//记得去添加自己常用文章图片的关键字，以及获取图片主色的方式

      //我这个是由于我用的阿里云的，于是这样写的

    if (url.includes(aliyun)) { 

      urlSuffix = "?x-oss-process=image/average-hue";

      const response = await axios.get(`${url}` + urlSuffix);

      return response.data.RGB;

    }

    const response = await axios.get(`${url}` + urlSuffix);

    const mainColorData = response.data.RGB; // Access the RGB field

    const mainColor = `#${mainColorData.slice(2)}`;

    return mainColor;

  } catch (error) {

    console.error("Error fetching main color:", error);

  }

}



function processFiles(dir) {

  const files = fs.readdirSync(dir);



  for (const file of files) {

    const fullPath = path.join(dir, file);



    if (fs.statSync(fullPath).isDirectory()) {

      processFiles(fullPath);

    } else if (path.extname(fullPath) === ".md") {

      addCoverAndMainColor(fullPath);

    }

  }

}



function formatISO8601ToCustomFormat(isoDateString) {

  // 检查输入是否已经是目标格式（"yyyy-MM-dd HH:mm:ss"）

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(isoDateString)) {

    return -1; // 如果已经是目标格式，则直接返回

  }

  const pubDateTime = new pubDateTime(isoDateString);



  const year = pubDateTime.getUTCFullYear();

  const month = (pubDateTime.getUTCMonth() + 1).toString().padStart(2, "0");

  const day = pubDateTime.getUTCDate().toString().padStart(2, "0");

  const hours = pubDateTime.getUTCHours().toString().padStart(2, "0");

  const minutes = pubDateTime.getUTCMinutes().toString().padStart(2, "0");

  const seconds = pubDateTime.getUTCSeconds().toString().padStart(2, "0");



  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}



async function addCoverAndMainColor(filePath) {

  const content = fs.readFileSync(filePath, "utf8");

  const yamlSection = content.match(/---\n([\s\S]*?)---/);



  if (!yamlSection) return;



  const data = yaml.load(yamlSection[1]);



  let updated = false;



  if (data.pubDateTime) {

    const _date = formatISO8601ToCustomFormat(data.pubDateTime);

    if (_date === -1) {

      updated = false;

    } else {

      data.pubDateTime = _date;

      updated = true;

    }

  }



  if (data.update) {

    const _update = formatISO8601ToCustomFormat(data.update);

    if (_update === -1) {

      updated = false;

    } else {

      data.update = _update;

      updated = true;

    }

  }



  if (!data.ogImage) {

    data.ogImage = await getCoverImage();

    updated = true;

  }



  if (!data.main_color) {

    data.main_color = await getMainColor(data.ogImage);

    updated = true;

  }



  if (updated) {

    const updatedYaml = yaml.dump(data);

    const updatedContent = content.replace(yamlSection[1], updatedYaml);

    fs.writeFileSync(filePath, updatedContent, "utf8");

    console.log(`Updated: ${filePath}`);

  }

}



processFiles(POSTS_DIR);



hexo.on("before_generate", async () => {

  console.log("Automatically updating ogImage and main color...");

  await processFiles(POSTS_DIR);

  console.log("ogImage and main color updated successfully!");

});



//在文件底部添加这段代码

hexo.on("before_generate", async () => {

  console.log("Automatically updating ogImage and main color...");

  await processFiles(POSTS_DIR);

  console.log("ogImage and main color updated successfully!");

});

```


