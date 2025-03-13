class AgentManager {
    constructor() {
        this.agents = [];
    }

    createAgent(role, specialty) {
        const newAgent = {
            id: this.generateId(),
            role: role,
            specialty: specialty,
            systemPrompt: this.generateSystemPrompt(role, specialty),
            modelConfig: this.getModelConfig(role),
            messages: [],
            performance: []
        };
        this.agents.push(newAgent);
        return newAgent;
    }

    generateId() {
        return 'agent-' + Math.random().toString(36).substr(2, 9);
    }

    generateSystemPrompt(role, specialty) {
        return `You are an expert in ${specialty} with the role of ${role}. Provide insights based on your expertise.`;
    }

    getModelConfig(role) {
        // Placeholder for model configuration logic based on role
        return {
            temperature: 0.7,
            max_tokens: 1000
        };
    }

    evaluateAgentPerformance(agentId, discussion) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            const score = this.calculatePerformanceScore(agent, discussion);
            const feedback = this.generateFeedback(score);
            agent.performance.push({ round: discussion.roundId, score: score, feedback: feedback });
        }
    }

    calculatePerformanceScore(agent, discussion) {
        // Placeholder for performance scoring logic
        return Math.floor(Math.random() * 10) + 1; // Random score for demonstration
    }

    generateFeedback(score) {
        if (score >= 8) {
            return "Excellent performance.";
        } else if (score >= 5) {
            return "Satisfactory performance.";
        } else {
            return "Needs improvement.";
        }
    }

    selectAgentsForNextRound(topic) {
        // Logic to select agents based on previous performance and topic relevance
        return this.agents.filter(agent => agent.performance.length > 0 && agent.performance[agent.performance.length - 1].score >= 5);
    }

    removeAgent(agentId) {
        this.agents = this.agents.filter(agent => agent.id !== agentId);
    }

    getAgentById(id) {
        return this.agents.find(agent => agent.id === id);
    }

    getAgents() {
        return this.agents;
    }

    async generateSpeech(agent, context) {
        // For now, return a placeholder response
        // In a real implementation, this would call the LLM service
        return `As ${agent.role}, I think this topic "${context.topic}" is interesting. This is round ${context.roundId}.`;
    }
}

// Export both as default and named export
export { AgentManager };
export default AgentManager;