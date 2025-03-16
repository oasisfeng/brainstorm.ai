package ai.brainstorm.core

data class Agent(
    val id: String,
    val role: String,
    val focus: String,
    val model: String = "gpt-4"
) {
    fun generateResponse(context: String): String {
        // Logic to generate a response based on the discussion context
        return "Response from $role with focus on $focus in context: $context"
    }
}