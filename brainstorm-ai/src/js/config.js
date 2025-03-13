const Config = {
    llmProviders: [
        {
            name: "OpenAI",
            apiUrl: "http://192.168.1.7:1234/v1",
            apiKey: "",
            models: ["gemma-3-12b-it@q6_k"],
            defaultParams: {
                temperature: 0.7,
                max_tokens: 1000
            }
        }
    ],
    defaultRoundDuration: 30,
    defaultAgentCount: 5,
    filePaths: {
        config: "./config.json",
        discussions: "./discussions/",
        userInput: "./user_input.txt"
    },

    load() {
        // For now, return the current config since it matches defaultConfig.json
        // In a real implementation, this would merge with user-specific config
        return this;
    }
};
export { Config };