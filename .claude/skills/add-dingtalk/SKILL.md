# Add DingTalk Skill

为 NanoClaw 添加钉钉（DingTalk）机器人通道集成。

## 功能说明

- 使用钉钉开放平台 Stream SDK 接收和发送消息
- 支持群聊和单聊消息
- 支持 @机器人 触发消息处理
- 支持 Markdown 格式消息（自动降级为文本）
- 支持长消息自动分割

## 环境变量配置

在 `.env` 文件中配置以下变量：

```bash
# DingTalk 应用凭证
DINGTALK_CLIENT_ID=your_client_id
DINGTALK_CLIENT_SECRET=your_client_secret

# 可选：启用调试日志
DEBUG=true
```

## 获取钉钉凭证步骤

1. 访问 [钉钉开发者后台](https://open-dev.dingtalk.com/)
2. 创建企业自建应用
3. 在「凭证与基础信息」页面获取：
   - Client ID（Agent Key）
   - Client Secret（Agent Secret）
4. 配置机器人功能：
   - 进入「机器人」功能页
   - 添加 Stream 模式回调
   - 配置消息接收地址（由 NanoClaw 自动处理）

## JID 格式

钉钉通道的 JID 前缀为 `ding:`：
- 群聊：`ding:cidxxxxx`
- 私聊：`ding:cidxxxxx`

## 触发规则

- **群聊**：需要 @Andy 触发（例如：`@Andy 今天天气如何`）
- **私聊**：直接发送消息即可（无需触发词）

## 支持的消息类型

| 类型 | 接收 | 发送 |
|------|------|------|
| 文本 | ✅ | ✅ |
| Markdown | ✅ | ✅ |
| 文件 | ✅ (占位符) | ❌ |
| 图片 | ✅ (占位符) | ❌ |
| 语音 | ✅ (占位符) | ❌ |
| 视频 | ✅ (占位符) | ❌ |

## 特殊命令

- `/chatid` - 获取当前会话的 Chat ID 和类型

## 测试方法

1. 启动 NanoClaw 服务
2. 在钉钉群里 @机器人 并发送 `/chatid`
3. 如果收到 Chat ID 回复，说明连接成功
4. 注册群组后，可以正常对话

## 常见问题

### 消息已读但未回复

检查：
1. 群组是否已注册到 NanoClaw
2. 消息是否包含触发词（群聊需要 @Andy）
3. 查看日志确认消息是否收到

### 连接失败

检查：
1. `DINGTALK_CLIENT_ID` 和 `DINGTALK_CLIENT_SECRET` 是否正确
2. 钉钉应用是否已启用 Stream 模式
3. 网络是否能访问钉钉 API

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/channels/dingtalk.ts` | DingTalk 通道实现 |
| `src/channels/dingtalk.test.ts` | 单元测试 |
| `src/channels/index.ts` | 通道注册入口 |
