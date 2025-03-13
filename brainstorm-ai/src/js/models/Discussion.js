class Discussion {
    constructor(roundId, startTime, endTime, messages = [], summary = '', agentEvaluations = {}) {
        this.roundId = roundId; // 当前讨论轮次
        this.startTime = startTime; // 讨论开始时间
        this.endTime = endTime; // 讨论结束时间
        this.messages = messages; // 讨论中的消息记录
        this.summary = summary; // 本轮讨论总结
        this.agentEvaluations = agentEvaluations; // 各 agent 的评估对象
    }

    addMessage(message) {
        this.messages.push(message); // 添加消息到讨论记录
    }

    setSummary(summary) {
        this.summary = summary; // 设置讨论总结
    }

    evaluateAgent(agentId, score, feedback) {
        this.agentEvaluations[agentId] = { score, feedback }; // 评估 agent 表现
    }

    getDiscussionDetails() {
        return {
            roundId: this.roundId,
            startTime: this.startTime,
            endTime: this.endTime,
            messages: this.messages,
            summary: this.summary,
            agentEvaluations: this.agentEvaluations
        }; // 获取讨论详情
    }
}

export default Discussion;