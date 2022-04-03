# gitlab代码提交统计-node定时任务

> 项目说明：  
> 1. 使用ldap账号密码登陆，sudo su - 切到root

------------------
### 主要技术栈
  - nodejs
  - pm2
  
------------------

### 开发命令
- 安装依赖
```
    npm install 或者 yarn install
```

- 开发模式启动    
```
    pm2 start app.js --name=schedule-gitlab-task --watch
    pm2 start juejin.js --name=schedule-juejin-task --watch
``` 

------------------
### 优点

1. 

