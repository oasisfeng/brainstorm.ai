# 详细设计文档

## 系统架构

### 整体架构
```
                  +----------------+
                  |                |
                  |   Web 前端     |
                  |                |
                  +-------+--------+
                          |
                          v
+------------+    +-------+--------+    +-----------------+
|            |    |                |    |                 |
| 语言模型API |<-->|  后端核心逻辑  |<-->|   状态管理系统   |
|            |    |                |    |                 |
+------------+    +-------+--------+    +-----------------+
                          |
                          v
                  +-------+--------+
                  |                |
                  |   日志系统     |
                  |                |
                  +----------------+
```

### 技术栈选择
- **前端**：React + TypeScript + Tailwind CSS
- **状态管理**：React Context API 或 Redux
- **API通信**：Axios
- **测试**：Jest + React Testing Library

## 核心组件设计

### 1. Agent 系统

```typescript
interface AgentConfig {
  id: string;
  role: string;
  systemPrompt: string;
  modelConfig: {
    provider: string;     // 如 "openai"
    model: string;        // 如 "gpt-4"
    temperature: number;
    apiUrlPrefix?: string; // 可选，自定义API端点
    apiParams?: Record<string, any>; // 其他API参数
  };
  expertise: string[];    // 专长领域
}

class Agent {
  private config: AgentConfig;
  private messageHistory: Message[];
  
  constructor(config: AgentConfig) {
    this.config = config;
    this.messageHistory = [];
  }

  async generateResponse(discussionContext: DiscussionContext): Promise<string> {
    // 构建完整的prompt上下文
    const prompt = this.buildPrompt(discussionContext);
    
    // 调用LLM API
    const response = await this.callLLMApi(prompt);
    
    // 保存到历史记录
    this.messageHistory.push({
      role: "assistant",
      content: response,
      timestamp: new Date()
    });
    
    return response;
  }

  private buildPrompt(discussionContext: DiscussionContext): string {
    // 根据角色、历史记录和讨论上下文构建prompt
  }

  private async callLLMApi(prompt: string): Promise<string> {
    // 调用配置的语言模型API
  }
}
```

### 2. 讨论管理器

```typescript
interface DiscussionConfig {
  topic: string;
  initialInfo: string;
  roundDuration: number; // 单位：分钟
  initialAgentCount: number;
}

interface DiscussionContext {
  topic: string;
  additionalInfo: string[];
  currentRound: number;
  messages: Message[];
  activeAgents: Agent[];
  removedAgents: Agent[];
}

class DiscussionManager {
  private config: DiscussionConfig;
  private context: DiscussionContext;
  private organizerLLM: OrganizerLLM;
  
  constructor(config: DiscussionConfig) {
    this.config = config;
    this.context = this.initializeContext();
    this.organizerLLM = new OrganizerLLM(config);
  }
  
  async startNewRound(): Promise<void> {
    // 1. 评估并淘汰表现不佳的Agent
    if (this.context.currentRound > 1) {
      await this.evaluateAgentsPerformance();
    }
    
    // 2. 根据主题确定是否需要新Agent
    await this.adjustAgentComposition();
    
    // 3. 开始新一轮讨论
    await this.runDiscussionRound();
  }
  
  async runDiscussionRound(): Promise<void> {
    // 执行讨论轮次，让各个agent轮流发言
  }
  
  async pauseDiscussion(): Promise<void> {
    // 暂停讨论，等待当前agent完成发言
  }
  
  async addAgent(description: string): Promise<Agent> {
    // 根据客户描述创建新的agent
    const agentConfig = await this.organizerLLM.generateAgentConfig(description, this.context);
    const newAgent = new Agent(agentConfig);
    this.context.activeAgents.push(newAgent);
    return newAgent;
  }
  
  async removeAgent(agentId: string): Promise<void> {
    // 从讨论中移除agent
  }
  
  async resumeDiscussion(): Promise<void> {
    // 恢复暂停的讨论
  }
  
  async summarizeRound(): Promise<string> {
    // 调用组织者LLM总结本轮讨论
    return this.organizerLLM.summarizeRound(this.context);
  }
  
  private async evaluateAgentsPerformance(): Promise<AgentEvaluation[]> {
    // 评估每个agent的表现
    return this.organizerLLM.evaluateAgents(this.context);
  }
}
```

### 3. 组织者LLM

```typescript
class OrganizerLLM {
  private modelConfig: any;
  
  constructor(config: any) {
    this.modelConfig = {
      provider: "openai",
      model: "gpt-4",
      temperature: 0.7,
      // 其他配置项
    };
  }
  
  async summarizeRound(context: DiscussionContext): Promise<string> {
    const prompt = this.buildSummaryPrompt(context);
    return this.callLLM(prompt);
  }
  
  async evaluateAgents(context: DiscussionContext): Promise<AgentEvaluation[]> {
    const evaluations: AgentEvaluation[] = [];
    
    for (const agent of context.activeAgents) {
      const prompt = this.buildEvaluationPrompt(agent, context);
      const evaluationResult = await this.callLLM(prompt);
      
      // 解析评估结果
      const parsedEvaluation = this.parseEvaluation(evaluationResult);
      evaluations.push({
        agentId: agent.getId(),
        score: parsedEvaluation.score,
        feedback: parsedEvaluation.feedback
      });
    }
    
    return evaluations;
  }
  
  async generateAgentConfig(description: string, context: DiscussionContext): Promise<AgentConfig> {
    const prompt = this.buildAgentCreationPrompt(description, context);
    const result = await this.callLLM(prompt);
    
    // 解析生成的agent配置
    return this.parseAgentConfig(result);
  }
  
  private buildSummaryPrompt(context: DiscussionContext): string {
    return `作为头脑风暴的组织者，请针对以下主题的第${context.currentRound}轮讨论进行总结：
主题：${context.topic}

讨论内容：
${this.formatDiscussionHistory(context.messages)}

请提供：
1. 本轮讨论的要点总结
2. 已达成的共识
3. 存在的分歧点
4. 值得在下一轮深入探讨的关键问题

总结应当客观、全面，并为下一轮讨论奠定基础。`;
  }
  
  private buildEvaluationPrompt(agent: Agent, context: DiscussionContext): string {
    // 构建用于评估agent表现的prompt
  }
  
  private buildAgentCreationPrompt(description: string, context: DiscussionContext): string {
    // 构建用于创建agent的prompt
  }
  
  private async callLLM(prompt: string): Promise<string> {
    // 调用LLM API
  }
}
```

## 数据模型

### 消息模型

```typescript
interface Message {
  id: string;
  senderId: string;
  senderType: "agent" | "customer" | "organizer";
  content: string;
  timestamp: Date;
  roundId: number;
}
```

### 评估模型

```typescript
interface AgentEvaluation {
  agentId: string;
  roundId: number;
  score: number; // 1-10分
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}
```

### 讨论轮次模型

```typescript
interface DiscussionRound {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: number; // 分钟
  summary: string;
  evaluations: AgentEvaluation[];
  messages: Message[];
}
```

## 用户界面设计

### 主界面布局

```
+---------------------------------------------------+
|                   主题区域                         |
+---------------------------------------------------+
|                                       | 控制面板   |
|                                       |            |
|                                       | - 暂停讨论  |
|                                       | - 添加Agent |
|        讨论内容显示区域                | - 移除Agent |
|                                       | - 恢复讨论  |
|                                       | - 结束轮次  |
|                                       |            |
|                                       | 状态信息:   |
|                                       | - 当前轮次  |
|                                       | - 剩余时间  |
|                                       |            |
+---------------------------------------------------+
|                  输入区域                          |
+---------------------------------------------------+
```

### 组件设计

1. **讨论区域组件**
   - 消息气泡组件（区分不同发言者）
   - 正在输入提示
   - 自动滚动到最新消息

2. **控制面板组件**
   - 讨论控制按钮
   - Agent管理界面
   - 轮次信息显示

3. **用户输入组件**
   - 文本输入框
   - 发送按钮
   - 快捷操作菜单

## API接口设计

### LLM服务接口

```typescript
interface LLMRequest {
  provider: string;
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  temperature: number;
  maxTokens?: number;
  apiParams?: Record<string, any>;
}

interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class LLMService {
  async callLLM(request: LLMRequest): Promise<LLMResponse> {
    // 根据provider选择不同的API实现
    switch(request.provider) {
      case "openai":
        return this.callOpenAI(request);
      case "anthropic":
        return this.callAnthropic(request);
      default:
        throw new Error(`Unsupported LLM provider: ${request.provider}`);
    }
  }
  
  private async callOpenAI(request: LLMRequest): Promise<LLMResponse> {
    // 调用OpenAI API
  }
  
  private async callAnthropic(request: LLMRequest): Promise<LLMResponse> {
    // 调用Anthropic API
  }
}
```

## 测试策略

### 单元测试

1. **Agent类测试**
   - 测试prompt构建逻辑
   - 测试消息历史记录管理
   - 使用模拟LLM响应测试生成功能

2. **DiscussionManager测试**
   - 测试讨论流程控制
   - 测试Agent管理功能
   - 测试状态转换逻辑

3. **OrganizerLLM测试**
   - 测试各种prompt生成逻辑
   - 测试评估解析算法
   - 测试总结生成功能

### 集成测试

1. **LLM集成测试**
   - 使用模拟服务器测试API调用
   - 验证请求格式和响应处理

2. **讨论流程测试**
   - 测试完整的讨论轮次流程
   - 验证状态变更和消息流转

3. **UI集成测试**
   - 测试用户交互流程
   - 验证界面更新和状态同步

## 实现流程

1. **搭建基础架构**
   - 创建项目脚手架
   - 设置开发环境和测试框架

2. **实现核心类**
   - 实现LLM服务接口
   - 实现Agent类
   - 实现DiscussionManager类
   - 实现OrganizerLLM类

3. **开发UI组件**
   - 实现基础布局和样式
   - 实现各功能组件
   - 集成状态管理系统

4. **集成测试和调优**
   - 编写并运行测试套件
   - 调整prompt设计和LLM参数
   - 优化用户体验

5. **部署和发布**
   - 配置生产环境
   - 优化性能和资源利用
   - 准备发布文档

## 提示工程设计

### Agent发言提示模板

```
你是一位{role}，在一个关于"{topic}"的头脑风暴讨论中。

以下是你的专长领域：
{expertise}

请基于之前的讨论，提供你的专业见解。你可以：
1. 分享新的视角或想法
2. 对之前的发言提出建设性的质疑
3. 深化已经提出的概念
4. 提出新的可能性或解决方案

当前讨论进展：
{discussionHistory}

最后一次发言是由{lastSpeaker}说的：
"{lastMessage}"

请以{role}的身份做出响应。如果你认为目前没有需要补充的内容，可以简短说明你此轮选择跳过发言。
```

### 组织者总结提示模板

```
你是一个头脑风暴会议的专业组织者，负责总结第{roundNumber}轮关于"{topic}"的讨论。

完整的讨论记录如下：
{fullDiscussion}

请提供以下内容：
1. 本轮讨论的3-5个关键见解或亮点
2. 参与者达成的共识点
3. 仍存在分歧或需要进一步探讨的问题
4. 对下一轮讨论的2-3个建议方向

你的总结应该：
- 客观、公正地反映所有参与者的贡献
- 突出最有价值和创新的想法
- 识别出讨论中的模式和趋势
- 为下一轮讨论奠定明确的基础

总结应当清晰、结构化，长度适中（约300-500字）。
```

### Agent评估提示模板

```
作为头脑风暴组织者，请评估以下参与者在关于"{topic}"的第{roundNumber}轮讨论中的表现。

参与者：{agentRole}（{agentId}）

参与者的所有发言：
{agentMessages}

整体讨论上下文：
{contextSummary}

请对该参与者的表现进行评估，并提供1-10分的打分（10分为最高），评估应考虑以下方面：
1. 贡献的相关性和价值
2. 思维的创新性和深度
3. 与其他参与者的互动质量
4. 专业知识的应用
5. 表达的清晰度和简洁性

请提供：
- 整体得分（1-10分）
- 表现优势（2-3点）
- 表现不足（2-3点）
- 针对性改进建议

评估应当客观、具体、建设性，并基于事实。
```

### Agent创建提示模板

```
作为头脑风暴组织者，请根据以下描述创建一个新的AI参与者角色配置。

讨论主题：{topic}
当前讨论概要：{discussionSummary}
现有参与者角色：{existingRoles}

用户请求添加的角色描述："{userDescription}"

请生成一个完整的角色配置，包括：

1. 角色名称（专业且具体）
2. 系统提示（指导AI如何扮演该角色的详细说明）
3. 专长领域（3-5个关键专长）
4. 建议的模型参数：
   - 合适的温度值（0.0-1.0）
   - 其他API参数建议

配置应当：
- 与讨论主题高度相关
- 补充现有参与者的专长和视角
- 能够为讨论带来新的维度或专业知识
- 具有明确的角色边界和专业特点

请以JSON格式输出配置，确保系统提示部分详细、具体且能有效引导模型扮演该角色。
```
