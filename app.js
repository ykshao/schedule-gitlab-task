//引入需要的模块
// node-schedule 为定时任务模块
const schedule = require("node-schedule");
const fetch = require('node-fetch')
var moment = require('moment');

// 箭头函数
const getProjects = async (token) => {
  const url = `https://gitlabnew.vhall.com/api/v4/projects?private_token=${token}&per_page=100`;
  const response = await fetch(url);
  return await response.json();
}

const getBranches = async (projectId, token) => {
  const url = encodeURI(`https://gitlabnew.vhall.com/api/v4/projects/${projectId}/repository/branches?private_token=${token}`);
  const response = await fetch(url);
  return await response.json();
}

const getCommits = async (projectId, token, name) => {
  const url = encodeURI(`https://gitlabnew.vhall.com/api/v4/projects/${projectId}/repository/commits?ref_name=${name}&private_token=${token}`);
  const response = await fetch(url);
  return await response.json();

}

const getCodeTotals = async (projectId, token, commitId) => {
  const url = encodeURI(`https://gitlabnew.vhall.com/api/v4/projects/${projectId}/repository/commits/${commitId}?private_token=${token}`);
  const response = await fetch(url);
  return await response.json();
}

// 在全局作用域下使用async关键字是非法的 需要声明一个匿名的函数表达式
const token = 'PKJ8A191hyZZUQX7szgk';
const commitsByUserStats = {};
const apiUrl = '';



//resData对象各属性请参考官方文档
// https://work.weixin.qq.com/help?doc_id=13376


async function requestfun() {

  const column = await getProjects(token);
  const projects = column.filter((project) => {
    return project.namespace.name == "FE"
  });

  try {

    let projectCount = projects.length;

    for (let i = 0; i < projectCount; i++) {
      let project = projects[i];
      const branchs = await getBranches(project.id, token);
      let branchsCount = branchs.length;
      for (let i = 0; i < branchsCount; i++) {
        let branch = branchs[i];
        const commits = await getCommits(project.id, token, branch.name);
        // console.log("commits---->", commits);
        //如果内容是合法的数组
        if (Array.isArray(commits)) {
          const commitsByTime = commits.filter(item => {
            let created_at_time = moment(item.created_at).format('YYYY-MM-DD HH:mm:ss');
            let pre_day_start = moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
            let pre_day_end = moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59');
            let isBetweenTime = moment(created_at_time).isBetween(pre_day_start, pre_day_end);
            return isBetweenTime
          });
          // console.log("commitsByTime----->", commitsByTime);
          if (commitsByTime.length > 0) {

            // for (const commit of commits) {
            //   const codeInfo = await getCodeTotals(project.id, token, commit.id);
            //   console.log(`${codeInfo}`)
            // }
            let commitsCount = commitsByTime.length;
            if (commitsCount > 0) {
              for (let i = 0; i < commitsCount; i++) {
                let commit = commitsByTime[i];
                let codeInfo = await getCodeTotals(project.id, token, commit.id);

                let author_name = commit.author_name;
                // console.log("commit------>", commit);
                if (commitsByUserStats[author_name]) {
                  //代码量统计
                  commitsByUserStats[author_name].additions += codeInfo.stats.additions;
                  commitsByUserStats[author_name].deletions += codeInfo.stats.deletions;
                  commitsByUserStats[author_name].total += codeInfo.stats.total;

                  //提交次数
                  commitsByUserStats[author_name].commitCount++;
                } else {
                  commitsByUserStats[author_name] = {
                    author_name: author_name,
                    additions: 0,
                    deletions: 0,
                    total: 0,
                    commitCount: 1
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log("commitsByUserStats------>", JSON.stringify(commitsByUserStats));

  } catch (e) {
    console.log(e)
  }

  //构建内容
  let sortCommitsByUserStats = [];
  let content = "#昨日SAAS前端团队代码提交次数+代码量统计\n";
  Object.keys(commitsByUserStats).forEach((key) => {
    sortCommitsByUserStats.push(commitsByUserStats[key]);
  });

  sortCommitsByUserStats.sort((pre, next) => {
    return next.commitCount - pre.commitCount;
  })

  sortCommitsByUserStats.forEach((item) => {
    // 这里 obj[key] 便是对象的每一个的值
    content += "> **" + item.author_name + "**: <font color=\"info\"> 共commit提交 **" + item.commitCount + "**次</font>\n";
    content += "> 新增代码行数: <font color=\"comment\">" + item.additions + "</font>\n";
    content += "> 删除代码行数: <font color=\"comment\">" + item.deletions + "</font>\n";
    content += "> 总共变更代码行数: <font color=\"comment\">" + item.total + "</font>\n";
  });

  let resData = {
    "msgtype": "markdown",
    "markdown": {
      "content": content
    }
  };

  // console.log(content)

  // url 为企业机器人的webhook
  const response = await fetch(apiUrl, {
    method: 'post',
    body: JSON.stringify(resData),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  console.log("data------->", data);
}

// 定时任务
const scheduleCronstyle = () => {
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob('0 0 10 * * 1-5', () => {
    requestfun();
  });
}
scheduleCronstyle();

// test
// requestfun();
