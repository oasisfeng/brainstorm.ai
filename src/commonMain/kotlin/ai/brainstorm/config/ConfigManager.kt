// ConfigManager.kt
package ai.brainstorm.config

/**
 * Manages configuration settings for the application
 */
class ConfigManager {
    // Default model settings
    private val defaultModelConfig = mapOf(
        "model" to "gpt-4",
        "temperature" to 0.7,
        "max_tokens" to 500
    )
    
    // Agent-specific model settings
    private val agentModelConfigs = mutableMapOf<String, Map<String, Any>>()
    
    // API configuration
    private var apiKey: String? = null
    private var apiEndpoint: String = "https://api.openai.com/v1"
    
    /**
     * Loads configuration from environment variables or config file
     * For MVP, we'll use default values or environment variables
     */
    fun loadConfig() {
        // In a real implementation, this would load from a config file or environment
        apiKey = System.getenv("OPENAI_API_KEY")
    }
    
    /**
     * Sets the API key
     */
    fun setApiKey(key: String) {
        apiKey = key
    }
    
    /**
     * Gets the API key
     */
    fun getApiKey(): String? {
        return apiKey
    }
    
    /**
     * Sets the API endpoint URL
     */
    fun setApiEndpoint(endpoint: String) {
        apiEndpoint = endpoint
    }
    
    /**
     * Gets the API endpoint URL
     */
    fun getApiEndpoint(): String {
        return apiEndpoint
    }
    
    /**
     * Gets model configuration for a specific agent
     */
    fun getModelConfig(agentId: String): Map<String, Any> {
        return agentModelConfigs[agentId] ?: defaultModelConfig
    }
    
    /**
     * Sets model configuration for a specific agent
     */
    fun setModelConfig(agentId: String, config: Map<String, Any>) {
        agentModelConfigs[agentId] = config
    }
    
    /**
     * Gets the default model configuration
     */
    fun getDefaultModelConfig(): Map<String, Any> {
        return defaultModelConfig
    }
}