package ai.brainstorm.api.model

import kotlinx.serialization.Serializable

@Serializable
data class ApiRequest(
    val model: String,
    val messages: List<ChatMessage>,
    val temperature: Double = 0.7,
    val tools: List<ToolCall>? = null
)