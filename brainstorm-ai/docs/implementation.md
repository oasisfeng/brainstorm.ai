# 详细设计文档

## 1. 系统架构

### 1.1 整体架构
系统采用前端单页应用架构，所有功能在浏览器中实现，无需服务器支持。架构分为以下几个主要模块：

- **核心控制器**: 协调整个系统的运行，管理讨论流程和状态
- **UI 界面**: 提供用户交互界面，显示讨论内容和控制选项
- **文件管理器**: 负责本地文件的读写操作
- **LLM 服务适配器**: 与云端 LLM API 交互
- **Agent 管理器**: 负责创建、配置和管理各个 AI agent
- **讨论管理器**: 控制讨论流程，包括轮次切换和发言调度

### 1.2 模块依赖关系
```
核心控制器
 ├── UI 界面
 ├── 文件管理器
 ├── LLM 服务适配器
 ├── Agent 管理器
 └── 讨论管理器
```

## 2. 数据结构

### 2.1 系统状态
```
SystemState {
    currentRound: Number,      // 当前讨论轮次
    topic: String,             // 讨论主题
    status: Enum[SETUP, DISCUSSING, PAUSED, SUMMARIZING, FINISHED],  // 系统状态
    agents: Array<Agent>,      // 当前参与讨论的所有 agent
    roundDuration: Number,     // 当前轮次的持续时间(分钟)
    history: Array<Discussion> // 历史讨论记录
}
```

### 2.2 Agent 结构
```
Agent {
    id: String,               // 唯一标识
    role: String,             // 角色名称
    specialty: String,        // 专业领域
    systemPrompt: String,     // 系统提示词
    modelConfig: Object,      // LLM 参数配置
    messages: Array<Message>, // 该 agent 的发言记录
    performance: Array<{      // 每轮表现评分
        round: Number,
        score: Number,
        feedback: String
    }>
}
```

### 2.3 讨论内容结构
```
Discussion {
    roundId: Number,
    startTime: DateTime,
    endTime: DateTime,
    messages: Array<Message>,
    summary: String,
    agentEvaluations: Object  // 键为 agentId，值为评估对象
}

Message {
    id: String,
    speakerId: String,        // agent的id或"client"或"organizer"
    timestamp: DateTime,
    content: String,
    type: Enum[NORMAL, QUESTION, SUMMARY, EVALUATION]
}
```

### 2.4 配置结构
```
Config {
    llmProviders: Array<{
        name: String,
        apiUrl: String,
        apiKey: String,
        models: Array<String>,
        defaultParams: Object
    }>,
    defaultRoundDuration: Number,
    defaultAgentCount: Number,
    filePaths: {
        config: String,
        discussions: String,
        userInput: String
    }
}
```

## 3. 核心模块设计

### 3.1 核心控制器 (CoreController)

#### 职责
- 初始化系统
- 管理系统状态
- 协调各模块间的交互
- 处理用户交互事件

#### 主要方法
- `initialize()`: 初始化系统，加载配置
- `startNewDiscussion(topic, duration)`: 开始新的讨论
- `continueDiscussion(filePath)`: 从已存在的讨论文件继续
- `pauseDiscussion()`: 暂停当前讨论
- `resumeDiscussion()`: 恢复暂停的讨论
- `finishRound()`: 结束当前轮次
- `handleUserInput(input)`: 处理用户输入

### 3.2 UI 界面 (UIManager)

#### 职责
- 渲染讨论界面
- 展示 agent 发言
- 提供用户交互控件
- 展示系统状态和提示

#### 主要方法
- `render()`: 渲染整个 UI
- `updateDiscussionView(messages)`: 更新讨论内容显示
- `showAgentInfo(agent)`: 显示 agent 信息
- `showControlPanel()`: 显示用户控制面板
- `renderUserInputForm()`: 渲染用户输入表单
- `showNotification(message)`: 显示通知消息

### 3.3 文件管理器 (FileManager)

#### 职责
- 处理本地文件读写
- 生成讨论记录 Markdown 文件
- 监控用户输入文件变化
- 保存和加载系统配置

#### 主要方法
- `requestFileSystemAccess()`: 请求文件系统访问权限
- `saveDiscussionToFile(discussion)`: 将讨论保存为 Markdown
- `loadDiscussionFromFile(filePath)`: 从文件加载讨论
- `watchUserInputFile()`: 监控用户输入文件
- `readUserInputFile()`: 读取用户输入文件内容
- `clearUserInputFile()`: 清空用户输入文件
- `saveConfig(config)`: 保存系统配置
- `loadConfig()`: 加载系统配置

### 3.4 LLM 服务适配器 (LLMServiceAdapter)

#### 职责
- 与 LLM API 交互
- 处理请求队列和重试机制
- 适配不同的 LLM 提供商
- 管理 API 密钥和参数

#### 主要方法
- `initialize(config)`: 初始化 LLM 服务配置
- `sendPrompt(prompt, modelConfig)`: 向 LLM 发送提示并获取回应
- `createChatCompletion(messages, modelConfig)`: 创建聊天完成请求
- `handleApiError(error)`: 处理 API 错误
- `getAvailableModels()`: 获取可用模型列表

### 3.5 Agent 管理器 (AgentManager)

#### 职责
- 创建和配置 agent
- 管理 agent 生命周期
- 评估 agent 表现
- 选择和淘汰 agent

#### 主要方法
- `createAgent(role, specialty)`: 创建新 agent
- `generateSystemPrompt(role, specialty)`: 生成 agent 系统提示词
- `evaluateAgentPerformance(agentId, discussion)`: 评估 agent 表现
- `selectAgentsForNextRound(topic)`: 为下一轮选择 agent
- `removeAgent(agentId)`: 移除 agent
- `getAgentById(id)`: 根据 ID 获取 agent

### 3.6 讨论管理器 (DiscussionManager)

#### 职责
- 控制讨论流程
- 协调 agent 发言顺序
- 生成讨论总结
- 管理讨论轮次

#### 主要方法
- `startRound(topic, agents, duration)`: 开始新一轮讨论
- `coordinateSpeaking()`: 协调 agent 发言
- `generateSpeech(agent, context)`: 生成 agent 发言
- `generateRoundSummary(discussion)`: 生成轮次总结
- `handleClientIntervention(action)`: 处理客户介入
- `finishRound()`: 结束当前轮次

## 4. 流程设计

### 4.1 讨论初始化流程
1. 用户提供讨论主题和初始设置
2. 系统根据主题生成适合的 agent 角色
3. 为每个角色创建和配置 agent
4. 确定首轮讨论时长
5. 开始第一轮讨论

### 4.2 讨论轮次流程
1. 组织者发表本轮讨论开场白（首轮）或上轮总结（非首轮）
2. 按顺序安排每个 agent 发言
3. 检测用户是否请求暂停
   - 如果暂停，处理用户输入（添加/移除 agent，提供信息等）
   - 恢复讨论时，从当前位置继续
4. 当所有 agent 发言完毕或时间结束，结束当前轮次
5. 生成本轮讨论总结
6. 评估各 agent 表现

### 4.3 用户交互流程
1. 用户可通过 UI 界面或特定文件提供输入
2. 系统持续监控两个输入通道
3. 收到用户输入后，暂停当前流程
4. 解析用户指令（添加/移除 agent，提供信息，调整参数等）
5. 执行相应操作
6. 恢复系统流程

## 5. 文件格式规范

### 5.1 讨论记录 Markdown 格式
```markdown
# [讨论主题] - 第[轮次]轮

## 基本信息
- **开始时间**: [时间]
- **持续时间**: [时长]分钟
- **参与角色**: [角色列表]

## 讨论内容

### [组织者]: [总结/开场白]
[内容]

### [角色名称]
[发言内容]

### [客户]
[客户输入内容]

...

## 本轮总结
[总结内容]

## Agent 评估
- **[角色名称]**: [分数]/10
  - [评价内容]
- **[角色名称]**: [分数]/10
  - [评价内容]
...
```

### 5.2 用户输入文件格式
```
[用户输入内容]

#END#
```

### 5.3 配置文件格式 (JSON)
```json
{
  "llmProviders": [
    {
      "name": "OpenAI",
      "apiUrl": "https://api.openai.com/v1",
      "apiKey": "",
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "defaultParams": {
        "temperature": 0.7,
        "max_tokens": 1000
      }
    }
  ],
  "defaultRoundDuration": 30,
  "defaultAgentCount": 5,
  "filePaths": {
    "config": "./config.json",
    "discussions": "./discussions/",
    "userInput": "./user_input.txt"
  }
}
```

## 6. 提示词设计

### 6.1 组织者提示词模板
```
你是一个头脑风暴讨论的组织者。你需要根据当前讨论的主题和上下文，[任务描述]。
当前讨论主题: {{topic}}
当前讨论轮次: {{roundNumber}}

[特定任务指令]

请确保你的回应简洁明了、中立客观，并能推动讨论向更深层次发展。
```

### 6.2 Agent 系统提示词模板
```
你是一个名为{{name}}的专家，专长领域是{{specialty}}。
在这场头脑风暴中，你需要从{{perspective}}的角度提供见解。

当前讨论主题: {{topic}}
当前讨论轮次: {{roundNumber}}

请根据你的专业背景和角色，就当前讨论主题发表见解。你可以回应其他参与者的观点，
也可以提出新的思路。请确保你的回应言之有物，并体现出你的专业特长。

如果你认为目前没有需要补充的内容，你可以简短说明并跳过这轮发言。
```

## 7. 错误处理策略

### 7.1 LLM API 错误
- 实现指数退避重试机制
- 在 UI 上显示错误状态
- 提供手动重试选项
- 记录错误日志

### 7.2 文件系统错误
- 请求必要的文件访问权限
- 在权限被拒绝时提供明确提示
- 提供备选的数据存储方式（如浏览器本地存储）
- 实现自动保存和恢复机制

### 7.3 用户输入错误
- 验证用户输入格式
- 提供明确的错误提示
- 为复杂操作提供确认步骤
- 支持撤销操作

## 8. 测试策略

### 8.1 单元测试
- 为每个核心模块编写单元测试
- 使用模拟对象替代外部依赖（如 LLM API）
- 测试各种边界条件和错误情况

### 8.2 集成测试
- 测试模块间的交互
- 验证数据流通过整个系统的正确性
- 测试复杂的用户交互场景

### 8.3 模拟 LLM 响应
- 创建模拟 LLM 服务以加速测试
- 预先准备多种响应场景
- 模拟各种 API 延迟和错误情况

## 9. 性能优化

### 9.1 API 调用优化
- 合理设置并发请求限制
- 实现请求合并和批处理
- 缓存常用提示词和响应

### 9.2 UI 性能
- 使用虚拟滚动优化长对话显示
- 延迟加载非关键资源
- 实现高效的 DOM 更新策略

### 9.3 文件操作优化
- 批量文件写入而非频繁小更新
- 使用流式处理大文件
- 实现增量更新而非全文件覆盖

## 10. 实现路线图

### 阶段一: 核心功能实现
1. 实现基础 UI 界面
2. 实现 LLM API 适配器
3. 实现文件系统管理
4. 实现基本的讨论流程

### 阶段二: 功能完善
1. 完善 Agent 管理和评估
2. 实现讨论总结生成
3. 优化用户交互流程
4. 添加文件监控功能

### 阶段三: 优化与扩展
1. 性能优化和错误处理完善
2. 增强 UI 体验
3. 添加更多自定义选项
4. 实现讨论导出和分享功能