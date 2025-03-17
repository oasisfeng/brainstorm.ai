// This file defines the Agent class, representing an AI agent with properties such as id, role, and focus.

package ai.brainstorm.model

data class Agent(
    val id: String,
    val role: String,
    val focus: String,
    val systemPrompt: String,
    val modelConfig: Map<String, Any>? = null
) {
    fun withUpdates(role: String? = null, focus: String? = null): Agent {
        return copy(
            role = role ?: this.role,
            focus = focus ?: this.focus
        )
    }
}