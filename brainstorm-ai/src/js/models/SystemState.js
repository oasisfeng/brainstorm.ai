class SystemState {
    constructor() {
        this.currentRound = 1; // 当前讨论轮次
        this.topic = ""; // 讨论主题
        this.status = "SETUP"; // 系统状态: SETUP, DISCUSSING, PAUSED, SUMMARIZING, FINISHED
        this.agents = []; // 当前参与讨论的所有 agent
        this.roundDuration = 30; // 当前轮次的持续时间(分钟)
        this.history = []; // 历史讨论记录
    }

    // 设置讨论主题
    setTopic(topic) {
        this.topic = topic;
    }

    // 获取当前讨论主题
    getTopic() {
        return this.topic;
    }

    // 更新当前轮次
    updateRound(round) {
        this.currentRound = round;
    }

    // 获取当前轮次
    getCurrentRound() {
        return this.currentRound;
    }

    // 设置系统状态
    setStatus(status) {
        this.status = status;
    }

    // 获取系统状态
    getStatus() {
        return this.status;
    }

    // 添加 agent
    addAgent(agent) {
        this.agents.push(agent);
    }

    // 移除 agent
    removeAgent(agentId) {
        this.agents = this.agents.filter(agent => agent.id !== agentId);
    }

    // 获取所有 agents
    getAgents() {
        return this.agents;
    }

    // 设置当前轮次的持续时间
    setRoundDuration(duration) {
        this.roundDuration = duration;
    }

    // 获取当前轮次的持续时间
    getRoundDuration() {
        return this.roundDuration;
    }

    // 添加讨论记录
    addDiscussionRecord(record) {
        this.history.push(record);
    }

    // 获取历史讨论记录
    getHistory() {
        return this.history;
    }
}

export default SystemState;