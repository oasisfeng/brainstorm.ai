class LLMServiceAdapter {
    constructor() {
        this.apiUrl = '';
        this.apiKey = '';
        this.defaultParams = {};
        this.models = [];
    }
    initialize(config) {
        this.apiUrl = config.apiUrl;
        this.apiKey = config.apiKey;
        this.models = config.models;
        this.defaultParams = config.defaultParams;
    }
    async sendPrompt(prompt, modelConfig = {}) {
        const response = await this._makeApiCall('POST', '/completions', {
            prompt: prompt,
            model: modelConfig?.model || this.models[0],
            ...this.defaultParams,
            ...(modelConfig?.params || {})
        });
        return response;
    }
    async createChatCompletion(messages, modelConfig = {}) {
        const response = await this._makeApiCall('POST', '/chat/completions', {
            messages: messages,
            model: modelConfig?.model || this.models[0],
            ...this.defaultParams,
            ...(modelConfig?.params || {})
        });
        return response;
    }
    async _makeApiCall(method, endpoint, body) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            this.handleApiError(response);
        }
        return response.json();
    }
    handleApiError(error) {
        console.error('API Error:', error);
        // Implement error handling logic here
    }
    async getAvailableModels() {
        const response = await this._makeApiCall('GET', '/models');
        return response.models;
    }
}

// Export both as default and named export
export { LLMServiceAdapter };
export default LLMServiceAdapter;