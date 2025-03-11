## 详细设计

### 界面元素

1. **主界面组件**
   - 主题输入区域：用户输入头脑风暴主题的文本框
   - 开始/继续按钮：启动新一轮讨论
   - 状态指示器：显示当前是否正在生成内容
   - 轮次导航：显示当前轮次，并允许查看历史轮次

2. **讨论显示区**
   - Agent 列表：显示当前参与讨论的所有 agents，包括角色名称和专长
   - 对话区域：显示当前轮次的所有发言，包括 agent 名称和发言内容
   - 轮次摘要：每轮结束后的讨论摘要

3. **控制面板**
   - 主题调整：允许用户在轮次间调整讨论主题
   - Agent 管理：查看、添加或移除特定 agent
   - 设置选项：调整 API 设置、语言模型参数等

### 执行流程

1. **初始化流程**
   - 加载配置（API 密钥、端点）
   - 初始化 UI 组件
   - 等待用户输入主题

2. **主题处理流程**
   - 验证主题有效性
   - 使用 [`PromptBuilder`](js/utils/promptBuilder.js) 构建初始提示
   - 通过 [`ModelConnector`](js/models/modelConnector.js) 确定合适的 agent 角色配置

3. **轮次管理流程**
   - [`SessionManager`](js/session/sessionManager.js) 负责整体会话控制
   - [`RoundManager`](js/session/roundManager.js) 处理单个轮次的执行
   - 每轮结束后，使用 [`Evaluator`](js/session/evaluator.js) 评估 agent 表现

4. **Agent 交互流程**
   - [`AgentManager`](js/agents/agentManager.js) 管理所有活跃的 agents
   - [`AgentFactory`](js/agents/agentFactory.js) 根据 [`AgentTypes`](js/agents/agentTypes.js) 创建不同类型的 agents
   - 每个 agent 通过 [`ModelConnector`](js/models/modelConnector.js) 获取 AI 模型响应

5. **总结生成流程**
   - 轮次结束后，收集所有 agent 的输入
   - 使用 [`SummaryGenerator`](js/utils/summaryGenerator.js) 生成讨论摘要
   - 更新 UI 显示结果

### 意外处理

1. **API 错误处理**
   - 请求超时：实现自动重试机制，最多重试 3 次
   - 授权错误：提示用户检查 API 密钥
   - 服务不可用：显示友好错误消息并建议稍后重试

2. **数据处理异常**
   - 空响应：提供默认回退内容或提示用户
   - 格式错误：实现容错解析，尽可能恢复有效内容

3. **用户交互异常**
   - 无效输入：提供即时验证和明确的错误提示
   - 中断操作：实现会话状态保存，允许用户恢复之前的讨论

4. **资源限制处理**
   - 令牌限制：监控并优化 prompt 长度，避免超过模型限制
   - 浏览器性能：实现渐进式渲染和懒加载机制

### 数据结构

1. **Session 对象**

   ```javascript
   {
     id: "session-uuid",
     topic: "讨论主题",
     rounds: [], // 轮次数组
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

2. **Round 对象**

   ```javascript
   {
     id: "round-uuid",
     roundNumber: 1,
     agents: [], // 参与该轮的 agents
     messages: [], // 该轮的所有消息
     summary: "轮次总结",
     evaluations: {} // agent_id: score 映射
   }
   ```

3. **Agent 对象**

   ```javascript
   {
     id: "agent-uuid",
     type: "AgentTypes.TYPE1",
     role: "角色名称",
     expertise: "专长领域",
     modelType: "ModelTypes.MODEL1",
     systemPrompt: "角色设定提示词"
   }
   ```

4. **Message 对象**

   ```javascript
   {
     id: "message-uuid",
     agentId: "agent-uuid",
     content: "消息内容",
     timestamp: timestamp,
     roundId: "round-uuid"
   }
   ```
