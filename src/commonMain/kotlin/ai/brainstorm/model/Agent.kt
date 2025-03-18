package ai.brainstorm.model

/**
 * Represents an AI agent with specific role and capabilities
 */
data class Agent(
    val id: String,
    val role: String,
    val focus: String,
    val systemPrompt: String,
    val modelConfig: Map<String, Any>? = null,
    val performance: Int = 0
) {
    /**
     * Creates a new Agent with updated properties
     */
    fun withUpdates(
        role: String? = null, 
        focus: String? = null, 
        systemPrompt: String? = null,
        modelConfig: Map<String, Any>? = null,
        performance: Int? = null
    ): Agent {
        return copy(
            role = role ?: this.role,
            focus = focus ?: this.focus,
            systemPrompt = systemPrompt ?: this.systemPrompt,
            modelConfig = modelConfig ?: this.modelConfig,
            performance = performance ?: this.performance
        )
    }
    
    /**
     * Returns a short description of the agent
     */
    fun getDescription(): String {
        return "$role (focused on $focus)"
    }
    
    /**
     * Returns the effective model configuration, using the provided default if none exists
     */
    fun getEffectiveModelConfig(defaultConfig: Map<String, Any>): Map<String, Any> {
        return modelConfig ?: defaultConfig
    }
}