package ai.brainstorm.api.model

import kotlinx.serialization.Serializable

@Serializable
data class ToolCall(
    val type: String,
    val function: ToolFunction
)

@Serializable
data class ToolFunction(
    val name: String,
    val arguments: String
)