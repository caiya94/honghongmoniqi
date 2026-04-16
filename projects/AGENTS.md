# 哄哄模拟器 - 开发规范文档

## 项目概述

**哄哄模拟器**是一个情侣互动游戏，AI扮演生气的对象，用户通过选择题的方式在10轮内把对方哄好。

### 核心特性

- 动态对话生成：每轮对话和选项都由 LLM 实时生成
- 情绪化语音：使用 TTS 自动生成语音
- 好感度系统：通过进度条展示，隐藏具体数值

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| UI 组件 | shadcn/ui (基于 Radix UI) |
| 样式 | Tailwind CSS 4 |
| AI 集成 | coze-coding-dev-sdk |
| 状态管理 | React Context API |

---

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # 对话生成 API
│   │   └── tts/route.ts        # 语音合成 API
│   ├── layout.tsx             # 全局布局
│   ├── page.tsx               # 主页面
│   └── globals.css            # 全局样式
├── components/
│   ├── StartScreen.tsx        # 开始界面
│   ├── GameScreen.tsx         # 游戏主界面
│   ├── GameOverScreen.tsx     # 结束界面
│   ├── AffectionBar.tsx       # 好感度进度条
│   ├── LoadingAnimation.tsx   # 加载动画
│   └── ui/                    # shadcn/ui 组件库
├── context/
│   └── GameContext.tsx        # 游戏状态管理
├── types/
│   └── game.ts                # 类型定义和常量
└── lib/
    └── utils.ts               # 通用工具函数
```

---

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发环境（端口 5000）
coze dev

# 生产构建
coze build

# 生产启动
coze start

# 代码检查
pnpm ts-check
pnpm lint
```

---

## 关键实现要点

### 1. 好感度系统

- **初始值**: 20
- **范围**: -50 ~ 100
- **胜利条件**: 10轮内好感度 >= 80
- **失败条件**: 好感度 < -50 或 10轮用完好感度 < 80

### 2. 情绪变化

| 好感度范围 | 情绪表现 |
|-----------|---------|
| -50 ~ 0 | 非常生气，冷暴力或激烈质问 |
| 0 ~ 30 | 还在生气，但愿意听你说 |
| 30 ~ 60 | 开始软化，嘴上生气但语气缓和 |
| 60 ~ 80 | 快被哄好了，可能撒娇或小声说"哼" |
| 80+ | 原谅了，但还要你保证不再犯 |

### 3. API 接口

#### POST /api/chat

对话生成接口，接收游戏状态，返回下一轮对话和选项。

```typescript
// 请求
{
  gender: 'female' | 'male',
  scenario: string,
  messages: Message[],
  affection: number,
  step: number,
  isGameOver: boolean,
  won: boolean
}

// 响应
{
  partnerMessage: string,
  options: Option[],
  isEnd: boolean
}
```

#### POST /api/tts

语音合成接口，接收文本和音色配置，返回音频 URL。

```typescript
// 请求
{
  text: string,
  speaker: string,
  uid: string
}

// 响应
{
  audioUri: string,
  audioSize: number
}
```

### 4. 语音配置

| VoiceType | Speaker | 适用性别 |
|-----------|---------|---------|
| gentle-female | zh_female_xiaohe_uranus_bigtts | 女 |
| cool-female | zh_female_vv_uranus_bigtts | 女 |
| cute-female | saturn_zh_female_keainvsheng_tob | 女 |
| deep-male | zh_male_m191_uranus_bigtts | 男 |
| gentle-male | zh_male_taocheng_uranus_bigtts | 男 |

### 5. 文本清理

TTS 调用前需要清理文本中的括号内容：

```typescript
const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/（[^）]*）/g, '')  // 去掉中文括号
    .replace(/\([^)]*\)/g, '')   // 去掉英文括号
    .replace(/\[[^\]]*\]/g, '')  // 去掉中括号
    .replace(/[「」『』]/g, '')  // 去掉其他标点
    .trim();
};
```

---

## 常见问题

### 1. 游戏流程卡住

检查：
- API 是否正常响应
- `isGeneratingRef` 防止重复请求
- useEffect 依赖数组是否正确

### 2. 语音不播放

检查：
- TTS API 是否返回 audioUri
- 音频 URL 是否有效
- 浏览器是否阻止自动播放

### 3. 对话重复

检查：
- API 接口的对话历史是否包含所有消息
- `lastGeneratedStepRef` 是否正确跟踪已生成的轮次

---

## 环境变量

| 变量名 | 说明 |
|--------|------|
| COZE_API_KEY | Coze API 密钥（用于 LLM 和 TTS） |
| COZE_BOT_ID | Bot ID |

---

## 测试接口

```bash
# 测试对话 API
curl -X POST -H "Content-Type: application/json" \
  -d '{"gender":"female","scenario":"忘记纪念日","messages":[],"affection":20,"isGameOver":false,"won":false}' \
  http://localhost:5000/api/chat

# 测试 TTS API
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"你好","speaker":"zh_female_xiaohe_uranus_bigtts","uid":"test"}' \
  http://localhost:5000/api/tts
```

---

## 部署

项目已配置 `.coze` 文件，可通过 Coze CLI 直接部署：

```bash
coze build && coze start
```
