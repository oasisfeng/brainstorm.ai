package ai.brainstorm.tools

import ai.brainstorm.agent.AgentManager
import ai.brainstorm.config.ConfigManager
import ai.brainstorm.model.Agent
import ai.brainstorm.model.Message

/**
 * Handles interactions with language models and processes tool calls
 */
class LlmTools(
    private val agentManager: AgentManager,
    private val configManager: ConfigManager
) {
    private var useMockResponse = true  // Default to mock responses for development
    private val mockProvider = MockLlmProvider()
    
    fun setUseMockResponse(mock: Boolean) {
        useMockResponse = mock
    }

    /**
     * Invokes an agent with the given message history
     */
    fun invokeAgent(
        agentId: String,
        messageHistory: List<Message>,
        promptOverride: String? = null
    ): String {
        val agent = agentManager.getAgent(agentId) ?: return "Error: Agent $agentId not found"
        
        return if (useMockResponse) {
            mockProvider.generateResponse(agent, messageHistory, promptOverride)
        } else {
            invokeLlmApi(agent, messageHistory, promptOverride)
        }
    }

    /**
     * Invoke real LLM API with proper system/user prompts
     */
    private fun invokeLlmApi(
        agent: Agent,
        messageHistory: List<Message>,
        promptOverride: String?
    ): String {
        // Build conversation history in the format expected by LLM API
        val messages = buildList {
            // System prompt based on agent role
            add(Message(
                sender = "system",
                content = promptOverride ?: buildSystemPrompt(agent)
            ))
            
            // Add conversation history
            addAll(messageHistory)
        }
        
        // TODO: Implement LLM API call with following steps:
        // 1. Get LLM configuration from configManager.getLlmConfig()
        // 2. Format messages according to the API spec (OpenAI compatible format)
        // 3. Make API request with proper headers and error handling
        // 4. Parse response and extract generated content
        // 5. Process any tool calls in the response
        return mockProvider.generateResponse(agent, messageHistory, promptOverride)
    }
    
    private fun buildSystemPrompt(agent: Agent): String {
        return """You are ${agent.role} focused on ${agent.focus}.
                |You can invoke other agents using the invokeAgent(id='agent_id') syntax.
                |You can add new agents using the assignAgent(id='id', role='role', focus='focus', systemPrompt='prompt') syntax.
                |Always end your response with an agent invocation.""".trimMargin()
    }

    /**
     * Extracts tool calls from a message content
     * In a real implementation, this would use more sophisticated parsing
     */
    fun extractToolCalls(content: String): List<Map<String, String>> {
        val toolCalls = mutableListOf<Map<String, String>>()
        
        // Extract assignAgent calls
        val assignPattern = "assignAgent\\(id='([^']+)',\\s*role='([^']+)',\\s*focus='([^']+)',\\s*systemPrompt='([^']+)'\\)".toRegex()
        val assignMatches = assignPattern.findAll(content)
        
        assignMatches.forEach { matchResult ->
            val (id, role, focus, systemPrompt) = matchResult.destructured
            toolCalls.add(mapOf(
                "tool" to "assignAgent",
                "id" to id,
                "role" to role,
                "focus" to focus,
                "systemPrompt" to systemPrompt
            ))
        }
        
        // Extract invokeAgent calls
        val invokePattern = "invokeAgent\\(id='([^']+)'\\)".toRegex()
        val invokeMatches = invokePattern.findAll(content)
        
        invokeMatches.forEach { matchResult ->
            val id = matchResult.groupValues[1]
            toolCalls.add(mapOf(
                "tool" to "invokeAgent",
                "id" to id
            ))
        }
        
        return toolCalls
    }
}