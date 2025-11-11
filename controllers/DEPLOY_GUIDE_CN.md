# Web记账APP部署指南

本指南将引导您如何将此Web记账APP项目部署到一台标准的Linux服务器（以Ubuntu为例）上。

我们将使用 Nginx 作为反向代理，PM2 作为Node.js的进程管理器，并使用 Certbot 配置免费的HTTPS。

---

### 1. 服务器准备

首先，您需要一台拥有root或sudo权限的Linux服务器。

**1.1 安装 Git**
```bash
sudo apt update
sudo apt install git -y
```

**1.2 安装 Node.js 和 npm**
我们推荐使用 Node.js 18.x 或更高版本。
```bash
# 安装 nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# 加载 nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装 Node.js LTS 版本
nvm install --lts
nvm use --lts
```
验证安装：
```bash
node -v
npm -v
```

**1.3 安装 PM2**
pm2 是一个强大的Node.js进程管理器，可以帮助您在后台运行应用，并在应用崩溃时自动重启。
```bash
npm install pm2 -g
```

**1.4 安装 Nginx**
Nginx 是一个高性能的Web服务器，我们将用它作为反向代理。
```bash
sudo apt install nginx -y
```

**1.5 安装 MongoDB**
项目使用 MongoDB 作为数据库。以下是在 Ubuntu 上安装 MongoDB 的步骤。
```bash
# 1. 导入 MongoDB GPG 密钥
sudo apt-get install gnupg
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 2. 为 MongoDB 创建列表文件
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. 更新本地包数据库
sudo apt-get update

# 4. 安装 MongoDB
sudo apt-get install -y mongodb-org

# 5. 启动并启用 MongoDB 服务
sudo systemctl start mongod
sudo systemctl enable mongod
```
验证 MongoDB 是否成功运行：
```bash
sudo systemctl status mongod
```
如果服务正在运行，您应该会看到 "active (running)" 的状态。

**1.6 配置 MongoDB 安全认证 (重要)**

默认安装的 MongoDB 没有开启权限认证，任何人都可以在服务器上直接访问数据库。为了安全，我们需要为应用创建一个专用的数据库用户，并开启权限认证。

**1. 进入 Mongo Shell**
```bash
mongosh
```

**2. 创建数据库用户**
进入 shell 后，执行以下命令。请将 `your_app_password` 替换为您自己的高强度密码。

```javascript
// 切换到你的应用数据库（如果不存在，会自动创建）
use jiyibi;

// 创建一个只对 jiyibi 数据库有读写权限的用户
db.createUser({
  user: "jiyibi_user",
  pwd: "your_app_password",  // <--- 在这里替换为你的安全密码
  roles: [
    { role: "readWrite", db: "jiyibi" }
  ]
});

// 退出 shell
exit;
```

**3. 启用访问控制**
现在我们需要编辑 MongoDB 的配置文件来强制执行用户认证。

```bash
sudo nano /etc/mongod.conf
```

找到 `#security:` 这一行（或者如果不存在就添加它），修改为如下内容：

```yaml
# ... 其他配置 ...

security:
  authorization: "enabled"

# ... 其他配置 ...
```
*注意：`mongod.conf` 是 YAML 格式，请注意缩进。`security:` 在行首，`authorization:` 前有两个空格。*

**4. 重启 MongoDB 服务**
保存并关闭文件后，重启 MongoDB 使配置生效。

```bash
sudo systemctl restart mongod
```
现在，数据库已受密码保护。

---

### 2. 部署代码

**2.1 克隆代码库**
将您的代码克隆到服务器的一个目录中，例如 `/var/www/jiyibi-app`。
```bash
# 创建目录
sudo mkdir -p /var/www/jiyibi-app
# 赋予权限
sudo chown -R $USER:$USER /var/www/jiyibi-app
# 克隆代码
git clone <您的代码库URL> /var/www/jiyibi-app
cd /var/www/jiyibi-app
```

**2.2 安装生产依赖**
进入项目目录，并只安装生产环境需要的依赖。
```bash
npm install --production
```

---

### 3. 环境配置

项目通过 `.env` 文件来管理环境变量。在项目根目录下创建一个 `.env` 文件。

```bash
cd /var/www/jiyibi-app
nano .env
```

> **Nano 编辑器提示:** 按 `Ctrl + O` 然后按 `Enter` 键来保存文件，按 `Ctrl + X` 退出。

将以下内容复制到 `.env` 文件中，并替换为您自己的配置：

```ini
# MongoDB 连接字符串
# 格式: mongodb://[username:password@]host1[:port1]/database
# 请务必使用您在 1.6 节中为 jiyibi_user 设置的密码替换 "your_app_password"
MONGO_URI=mongodb://jiyibi_user:your_app_password@localhost:27017/jiyibi

# Node.js 服务器运行的端口
PORT=5000

# JWT 签名密钥 (请使用一个长且随机的字符串)
JWT_SECRET=your_super_long_and_random_jwt_secret

# 前端应用的公开访问URL (用于CORS配置)
FRONTEND_URL=http://your_domain.com
```
**重要提示**: `JWT_SECRET` 应该是一个长、随机且无法预测的高强度密钥。为了安全，强烈建议在您自己的服务器上生成它，而不是使用在线工具。

您可以使用 `openssl` 命令来生成一个符合要求的密钥：
```bash
openssl rand -base64 32
```
执行该命令会生成一个随机字符串，将其复制并粘贴到 `JWT_SECRET=` 后面即可。

---

### 4. 使用 PM2 运行应用

现在，您可以使用 PM2 来启动您的Node.js应用。

```bash
cd /var/www/jiyibi-app

# 使用 pm2 启动应用
# --name "jiyibi-api" 是给这个进程起一个名字，方便管理
pm2 start npm --name "jiyibi-api" -- run start
```

> **重要提示:** 如果您在应用启动后修改了 `.env` 配置文件（例如更新了数据库密码），您必须重启应用才能使新配置生效。重启命令为： `pm2 restart jiyibi-api`

**常用PM2命令:**
- `pm2 list`: 查看所有正在运行的应用
- `pm2 stop jiyibi-api`: 停止应用
- `pm2 restart jiyibi-api`: 重启应用
- `pm2 logs jiyibi-api`: 查看应用的日志
- `pm2 startup` 和 `pm2 save`: 设置开机自启

---

### 5. 配置 Nginx 反向代理

现在，您的应用正在 `localhost:5000` 上运行。我们需要配置Nginx将来自公网的HTTP请求转发到这个端口。

**5.1 创建 Nginx 配置文件**
```bash
sudo nano /etc/nginx/sites-available/jiyibi.conf
```

将以下配置粘贴到文件中。请务必将 `your_domain.com` 替换为您的域名。

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 根目录和静态文件处理
    # 直接由Nginx处理public目录下的静态文件，效率更高
    root /var/www/jiyibi-app/public;
    index index.html;

    # API 请求反向代理
    # 将所有 /api/ 开头的请求转发给Node.js应用
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 其他所有请求都返回前端应用入口
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**5.2 启用配置**
```bash
# 创建软链接以启用该配置
sudo ln -s /etc/nginx/sites-available/jiyibi.conf /etc/nginx/sites-enabled/

# 测试Nginx配置是否有语法错误
sudo nginx -t

# 重启Nginx使配置生效
sudo systemctl restart nginx
```

此时，通过 `http://your_domain.com` 应该已经可以访问您的应用了。

---

### 6. 配置 HTTPS (推荐)

为了数据安全，强烈建议您为您的域名配置SSL证书。我们将使用 Let's Encrypt 提供的免费证书。

**6.1 安装 Certbot**
Certbot 是一个可以自动获取和续订Let's Encrypt证书的工具。
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**6.2 获取并配置证书**
Certbot 会自动读取您的Nginx配置，为 `your_domain.com` 申请证书，并自动修改Nginx配置以启用HTTPS。
```bash
# --nginx: 使用Nginx插件
# -d your_domain.com: 为哪个域名申请证书
# --redirect: 将所有HTTP请求自动重定向到HTTPS
sudo certbot --nginx -d your_domain.com --redirect
```
按照提示操作即可。Certbot 还会自动设置一个定时任务来续订证书。

---

### 7. 防火墙设置

如果您的服务器开启了防火墙（例如 `ufw`），请确保开放了Nginx的端口。

```bash
# 允许 Nginx Full (包含80和443端口)
sudo ufw allow 'Nginx Full'

# 查看防火墙状态
sudo ufw status
```

---

部署完成！现在您的应用应该可以通过 `https://your_domain.com` 安全地访问了。

---

### 8. 项目初始化使用说明

由于项目采用邀请码机制注册，且管理员账户需要手动设置，因此在首次部署后，您需要按以下步骤创建第一个管理员账户。

#### 步骤 1: 手动创建第一个邀请码

在没有任何用户的情况下，无法通过 API 生成邀请码。您需要直接在数据库中创建第一个。

1.  **连接到 MongoDB Shell:**
    ```bash
    mongosh
    ```

2.  **执行以下命令创建一个邀请码:**
    ```javascript
    // 切换到您的数据库
    use jiyibi;

    // 插入一个邀请码文档
    db.invitationcodes.insertOne({
      code: "ADMIN-SETUP-CODE", // 您可以自定义这个初始邀请码
      usesLeft: 1,              // 仅供首次注册使用
      createdBy: null,
      createdAt: new Date(),
      usedBy: []
    });
    ```

#### 步骤 2: 注册您的第一个账户

1.  **访问应用:** 打开您的网站 `https://your_domain.com`。
2.  **注册:** 点击注册按钮，使用您的邮箱和密码，并在邀请码字段中填入您刚刚创建的 `ADMIN-SETUP-CODE`。
3.  完成注册后，您的账户现在是一个普通用户。

#### 步骤 3: 将您的账户提升为管理员

1.  **再次连接到 MongoDB Shell:**
    ```bash
    mongosh
    ```

2.  **执行以下命令更新用户角色:**
    ```javascript
    // 切换到您的数据库
    use jiyibi;

    // 将您刚刚注册的用户角色更新为 'isacc' (管理员)
    // 请将 "your_registered_email@example.com" 替换为您注册时使用的邮箱
    db.users.updateOne(
      { "email": "your_registered_email@example.com" },
      { $set: { "role": "isacc" } }
    );
    ```

3.  **验证 (可选):**
    ```javascript
    db.users.findOne({ "email": "your_registered_email@example.com" });
    ```
    确认 `role` 字段已变为 `isacc`。

完成以上步骤后，请重新登录您的账户。该账户现在拥有管理员权限，可以通过 API (`POST /api/invitation-codes`) 或应用界面（如果已实现）为其他用户生成新的邀请码。