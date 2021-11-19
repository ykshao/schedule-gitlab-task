//引入需要的模块
// node-schedule 为定时任务模块
const schedule = require("node-schedule");
const fetch = require('node-fetch')
var moment = require('moment');

//请求参数
let params = {
  cate_id: "6809637767543259144",
  cursor: "0",
  id_type: 2,
  limit: 10,
  sort_type: 200,
  tag_id: "6809640407484334093"
}

// 箭头函数
const getProjects = async () => {
  const url = `https://api.juejin.cn/recommend_api/v1/article/recommend_cate_tag_feed?aid=2608&uuid=6960251480684283406`;
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      'X-Agent': 'Juejin/Web'
    }
  });
  return await response.json();
}


//resData对象各属性请参考官方文档
// https://work.weixin.qq.com/help?doc_id=13376


async function requestfun() {

  const projects = await getProjects();
  const articleData = projects.data;

  //构建内容
  let content = "# 每日掘金优质前端文章推送\n";

  let projectCount = articleData.length;
  for (let i = 0; i < projectCount; i++) {
    let article = articleData[i];
    content += "> " + (i + 1).toString().padStart(2, '0') + "、[" + article.article_info.title + "](https://juejin.cn/post/" + article.article_id + ")\n";
  }

  let resData = {
    "msgtype": "markdown",
    "markdown": {
      "content": content
    }
  };

  // console.log(content)

  // url 为企业机器人的webhook
  await fetch('', {
    method: 'post',
    body: JSON.stringify(resData),
    headers: { 'Content-Type': 'application/json' }
  });
}

// 定时任务
const scheduleCronstyle = () => {
  //周一到周五的 10点30分推送消息
  schedule.scheduleJob('0 30 10 * * 1-5', () => {
    requestfun();
  });
}
scheduleCronstyle();

// requestfun();
