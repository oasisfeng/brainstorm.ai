class UIManager {
    constructor(coreController) {
        this.coreController = coreController;
        this.discussionContainer = document.getElementById('discussion-panel');
        this.controlPanel = document.getElementById('control-panel');
        this.notificationArea = document.createElement('div');
        this.notificationArea.id = 'notification-area';
        document.body.appendChild(this.notificationArea);
        
        // Set up global error handling
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            this.showError(`${msg}\nAt: ${url}:${lineNo}`);
            console.error(error);
        };

        // Handle unhandled promise rejections
        window.onunhandledrejection = (event) => {
            this.showError(`Async Error: ${event.reason}`);
            console.error(event.reason);
        };
    }

    render() {
        this.setupInitialUI();
        if (this.coreController && this.coreController.getCurrentDiscussion) {
            const currentDiscussion = this.coreController.getCurrentDiscussion();
            if (currentDiscussion) {
                this.updateDiscussionView(currentDiscussion.messages);
            } else {
                this.showEmptyDiscussion();
            }
        } else {
            this.showEmptyDiscussion();
        }
    }

    setupInitialUI() {
        if (!this.discussionContainer) return;
        
        this.discussionContainer.innerHTML = `
            <div class="topic-input">
                <input type="text" id="topicInput" placeholder="Enter discussion topic">
                <button id="startDiscussionBtn">Start Discussion</button>
            </div>
            <div class="discussion-content"></div>
            <div class="discussion-controls">
                <button id="pauseDiscussionBtn">Pause</button>
                <button id="resumeDiscussionBtn">Resume</button>
            </div>
        `;
    }

    showEmptyDiscussion() {
        const content = this.discussionContainer.querySelector('.discussion-content');
        if (content) {
            content.innerHTML = '<div class="empty-state">No active discussion. Enter a topic to begin.</div>';
        }
    }

    updateDiscussionView(messages) {
        const content = this.discussionContainer.querySelector('.discussion-content');
        if (!content) return;

        content.innerHTML = messages.map(message => `
            <div class="message ${message.speakerId === 'user' ? 'user-message' : 'agent-message'}">
                <strong>${message.speakerId}:</strong>
                <p>${message.content}</p>
                <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
            </div>
        `).join('');
        
        // Scroll to bottom
        content.scrollTop = content.scrollHeight;
    }

    getTopicInput() {
        const input = document.getElementById('topicInput');
        return input ? input.value.trim() : '';
    }

    showRoundSummary(summary) {
        const content = this.discussionContainer.querySelector('.discussion-content');
        if (!content) return;

        content.insertAdjacentHTML('beforeend', `
            <div class="round-summary">
                <h3>Round ${summary.roundId} Summary</h3>
                <p><strong>Topic:</strong> ${summary.topic}</p>
                <p><strong>Duration:</strong> ${summary.duration} minutes</p>
                <p><strong>Messages:</strong> ${summary.messages.length}</p>
            </div>
        `);
    }

    displayAgentEvaluation(agent, score) {
        const content = this.discussionContainer.querySelector('.discussion-content');
        if (!content) return;

        content.insertAdjacentHTML('beforeend', `
            <div class="agent-evaluation">
                <p><strong>${agent.role}:</strong> Score: ${score}/10</p>
            </div>
        `);
    }

    showNotification(message) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        notificationElement.innerText = message;
        this.notificationArea.appendChild(notificationElement);
        setTimeout(() => {
            this.notificationArea.removeChild(notificationElement);
        }, 3000);
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-notification';
        errorElement.innerHTML = `
            <div class="error-content">
                <strong>Error:</strong> ${message}
            </div>
            <button class="error-close">×</button>
        `;
        
        // Add close button handler
        errorElement.querySelector('.error-close').onclick = () => {
            this.notificationArea.removeChild(errorElement);
        };

        this.notificationArea.appendChild(errorElement);
    }
}

export default UIManager;