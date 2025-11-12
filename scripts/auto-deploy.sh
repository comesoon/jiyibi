#!/bin/bash

# 定时部署脚本
# 用于定期检查代码更新并自动部署

# 设置项目路径
PROJECT_PATH="/var/www/jiyibi-app"  # 替换为实际的项目路径
REPO_PATH="https://github.com/comesoon/jiyibi.git"  # 替换为实际的裸仓库路径

# 进入项目目录
cd $PROJECT_PATH

# 记录执行时间
echo "[$(date)] Starting auto deployment check" >> /var/log/deploy.log

# 从远程仓库拉取最新代码
git --work-tree=$PROJECT_PATH --git-dir=$REPO_PATH fetch origin main

# 检查是否有更新
LOCAL=$(git --work-tree=$PROJECT_PATH --git-dir=$REPO_PATH rev-parse HEAD)
REMOTE=$(git --work-tree=$PROJECT_PATH --git-dir=$REPO_PATH rev-parse origin/main)

if [ $LOCAL != $REMOTE ]; then
    # 有更新，执行部署
    echo "[$(date)] Updates found, deploying..." >> /var/log/deploy.log
    
    # 检出最新代码
    git --work-tree=$PROJECT_PATH --git-dir=$REPO_PATH reset --hard origin/main
    
    # 安装依赖
    npm install >> /var/log/deploy.log 2>&1
    
    # 重启应用 - 使用绝对路径
    npx pm2 reload $PROJECT_PATH/ecosystem.config.js --env production >> /var/log/deploy.log 2>&1
    
    echo "[$(date)] Deployment completed successfully" >> /var/log/deploy.log
else
    echo "[$(date)] No updates found" >> /var/log/deploy.log
fi