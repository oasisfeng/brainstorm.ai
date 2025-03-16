package ai.brainstorm.api.tools

data class ToolCall(
    val name: String,
    val arguments: Map<String, Any>
) {
    fun toJson(): String {
        return """{
            "name": "$name",
            "arguments": ${arguments.toJson()}
        }""".trimIndent()
    }

    private fun Map<String, Any>.toJson(): String {
        return entries.joinToString(", ") { "\"${it.key}\": ${it.value}" }
    }
}