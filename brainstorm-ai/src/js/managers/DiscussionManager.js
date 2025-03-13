class DiscussionManager {
    constructor(coreController, agentManager, uiManager) {
        this.coreController = coreController;
        this.agentManager = agentManager;
        this.uiManager = uiManager;
        this.currentRound = 0;
        this.agents = [];
        this.discussionHistory = [];
        this.isPaused = false;
    }

    startRound(topic, agents, duration) {
        this.currentRound++;
        this.topic = topic;
        this.agents = agents;
        this.duration = duration;
        this.discussionHistory = [];
        this.isPaused = false;
        this.uiManager.showNotification(`Starting round ${this.currentRound}`);
        this.coordinateSpeaking();
    }

    coordinateSpeaking() {
        if (this.isPaused) return;

        let speakingOrder = this.agents.slice();
        let currentIndex = 0;

        const speakNext = () => {
            if (this.isPaused) return;
            if (currentIndex < speakingOrder.length) {
                const agent = speakingOrder[currentIndex];
                this.generateSpeech(agent).then(() => {
                    currentIndex++;
                    speakNext();
                });
            } else {
                this.endRound();
            }
        };

        speakNext();
    }

    async generateSpeech(agent) {
        const context = this.getDiscussionContext();
        const speech = await this.agentManager.generateSpeech(agent, context);
        this.discussionHistory.push({
            speakerId: agent.id,
            content: speech,
            timestamp: new Date()
        });
        this.uiManager.updateDiscussionView(this.discussionHistory);
    }

    getDiscussionContext() {
        return {
            roundId: this.currentRound,
            topic: this.topic,
            history: this.discussionHistory,
            agents: this.agents
        };
    }

    endRound() {
        const summary = this.generateRoundSummary();
        this.uiManager.showRoundSummary(summary);
        this.evaluateAgents();
        this.prepareNextRound();
    }

    generateRoundSummary() {
        return {
            roundId: this.currentRound,
            topic: this.topic,
            messages: this.discussionHistory,
            duration: this.duration
        };
    }

    evaluateAgents() {
        this.agents.forEach(agent => {
            const score = this.evaluateAgentPerformance(agent);
            this.uiManager.displayAgentEvaluation(agent, score);
        });
    }

    evaluateAgentPerformance(agent) {
        const messageCount = this.discussionHistory.filter(m => m.speakerId === agent.id).length;
        return Math.min(Math.max(messageCount * 2, 1), 10);
    }

    prepareNextRound() {
        this.uiManager.showNotification('Round finished. Preparing for next round...');
    }

    getCurrentDiscussion() {
        return this.currentRound > 0 ? {
            round: this.currentRound,
            topic: this.topic,
            messages: this.discussionHistory,
            agents: this.agents
        } : null;
    }

    resumeRound() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.uiManager.showNotification('Discussion resumed');
        this.coordinateSpeaking();
    }

    handleUserInput(input) {
        if (!this.isPaused) {
            this.discussionHistory.push({
                speakerId: 'user',
                content: input,
                timestamp: new Date()
            });
            this.uiManager.updateDiscussionView(this.discussionHistory);
        }
    }
}

// Export both as default and named export
export { DiscussionManager };
export default DiscussionManager;