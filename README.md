# Check In Control

一个部署在 Vercel 的单用户远程打卡规则管理系统。

## 功能

- 周规则与日覆盖规则并存，优先级为 `日覆盖 > 周规则 > 默认不打卡`
- 所有日期与星期判定固定使用 `Asia/Shanghai`
- 首次默认密码登录后强制改密
- 生成带随机 `api_key` 的快捷指令访问地址
- 月历界面可视化查看和编辑今日及未来日期
- 网络失败时，iOS 快捷指令仍可按本地“周四到周日打卡”兜底

## 技术栈

- `Next.js` App Router
- `Postgres`（推荐 Supabase）
- 原生 `crypto.scrypt` 做密码散列
- HMAC 签名 Cookie 会话

## 本地运行

1. 复制环境变量模板：

```bash
cp .env.example .env.local
```

2. 填写数据库地址、默认密码、会话密钥和部署域名。

3. 安装依赖并启动：

```bash
npm install
npm run dev
```

首次访问时，服务会自动创建表并写入默认数据：

- 单管理员账号
- `Asia/Shanghai` 固定时区
- 随机 `api_key`
- 默认周规则：周四到周日打卡

## 部署到 Vercel

1. 把代码推到 GitHub。
2. 在 Vercel 导入该仓库。
3. 绑定 Postgres 数据库，推荐 Supabase。
4. 在 Vercel 项目里配置以下环境变量：
   - `DATABASE_URL`
   - `DATABASE_SSL`
   - `DEFAULT_ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. 触发首次部署。

## 快捷指令接口

- 接口地址：`GET /api/checkin/today?key=<api_key>`
- 成功返回纯文本：

```txt
true
```

- 鉴权失败返回：

```json
{ "error": "unauthorized" }
```

建议快捷指令逻辑：

1. 先请求上面的接口。
2. 如果成功，读取 `checkin` 决定是否继续打开钉钉。
3. 如果请求失败或超时，回退到本地“周四到周日执行”的旧逻辑。

## 测试

```bash
npm test
npm run build
```
