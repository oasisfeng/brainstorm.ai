class Agent {
    constructor(id, role, specialty, systemPrompt, modelConfig) {
        this.id = id; // 唯一标识
        this.role = role; // 角色名称
        this.specialty = specialty; // 专业领域
        this.systemPrompt = systemPrompt; // 系统提示词
        this.modelConfig = modelConfig; // LLM 参数配置
        this.messages = []; // 该 agent 的发言记录
        this.performance = []; // 每轮表现评分
    }
    addMessage(message) {
        this.messages.push(message);
    }
    evaluatePerformance(round, score, feedback) {
        this.performance.push({ round, score, feedback });
    }
}

// Export both as default and named export
export { Agent };
export default Agent;