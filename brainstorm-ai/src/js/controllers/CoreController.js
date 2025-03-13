import { SystemState } from '../models/index.js';
import { AgentManager, DiscussionManager, FileManager, UIManager } from '../managers/index.js';
import { Config } from '../config.js';

class CoreController {
    constructor() {
        this.systemState = new SystemState();
        this.fileManager = new FileManager();
        this.agentManager = new AgentManager();
        this.uiManager = new UIManager(this);
        this.discussionManager = new DiscussionManager(this, this.agentManager, this.uiManager);
    }

    initialize() {
        this.loadConfig();
        this.createDefaultAgent();
        this.uiManager.render();
        this.setupEventListeners();
    }

    createDefaultAgent() {
        // Create a default agent to start with
        this.agentManager.createAgent(
            'General Expert',
            'Critical Thinking'
        );
    }

    loadConfig() {
        const config = Config.load();
        this.systemState.defaultRoundDuration = config.defaultRoundDuration;
        this.systemState.defaultAgentCount = config.defaultAgentCount;
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startDiscussionBtn');
        const pauseBtn = document.getElementById('pauseDiscussionBtn');
        const resumeBtn = document.getElementById('resumeDiscussionBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const topic = this.uiManager.getTopicInput();
                const duration = this.systemState.defaultRoundDuration;
                this.startNewDiscussion(topic, duration);
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pauseDiscussion();
            });
        }

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeDiscussion();
            });
        }
    }

    startNewDiscussion(topic, duration) {
        if (!topic) {
            this.uiManager.showError('Topic is required to start a discussion');
            return;
        }
        this.systemState.topic = topic;
        this.systemState.currentRound = 1;
        this.systemState.status = 'DISCUSSING';
        this.discussionManager.startRound(topic, this.agentManager.getAgents(), duration);
    }

    pauseDiscussion() {
        this.systemState.status = 'PAUSED';
        this.uiManager.showNotification('Discussion paused. You can make changes now.');
    }

    resumeDiscussion() {
        this.systemState.status = 'DISCUSSING';
        this.discussionManager.resumeRound();
    }

    finishRound() {
        this.discussionManager.finishRound();
        this.systemState.currentRound++;
    }

    handleUserInput(input) {
        if (this.systemState.status === 'DISCUSSING') {
            this.discussionManager.handleUserInput(input);
        }
    }

    getCurrentDiscussion() {
        return this.discussionManager ? this.discussionManager.getCurrentDiscussion() : null;
    }
}

export default CoreController;