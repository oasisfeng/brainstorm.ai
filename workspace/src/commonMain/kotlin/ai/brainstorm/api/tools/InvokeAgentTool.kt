package ai.brainstorm.api.tools

import ai.brainstorm.core.Agent
import ai.brainstorm.api.model.ApiRequest
import ai.brainstorm.api.model.ApiResponse
import ai.brainstorm.api.LlmClient
import ai.brainstorm.api.model.ChatMessage

class InvokeAgentTool(private val llmClient: LlmClient) {
    suspend fun invokeAgent(agent: Agent, prompt: String): ApiResponse {
        val request = ApiRequest(
            model = agent.model,
            messages = listOf(
                ChatMessage(role = "user", content = prompt)
            )
        )
        
        return llmClient.sendRequest(request)
    }
}