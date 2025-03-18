// AgentManager.kt
package ai.brainstorm.agent

import ai.brainstorm.model.Agent
import ai.brainstorm.model.Message
import ai.brainstorm.tools.LlmTools

class AgentManager(private val defaultSystemPrompt: String) {

    companion object {
        const val ORGANIZER = "organizer"
        const val USER = "user"
    }

    private val agents: MutableMap<String, Agent> = mutableMapOf()
    private val llmTools: LlmTools = LlmTools(this)
    
    fun getAgent(id: String) = agents[id]
    
    /**
     * Invokes an agent with the given message history to generate a response
     */
    fun invokeAgentWithHistory(
        agentId: String,
        messageHistory: List<Message>,
        promptOverride: String? = null
    ): String {
        return llmTools.invokeAgent(agentId, messageHistory, promptOverride)
    }
    
    /**
     * Assigns a new agent or updates an existing one
     *
     * @param id The unique identifier for the agent
     * @param role The role of the agent
     * @param focus The agent's focus or specialty
     * @param systemPrompt The system prompt to use (defaults to the default system prompt if creating a new agent)
     * @param modelConfig Optional configuration parameters for the model
     * @return The newly created or updated Agent
     */
    fun assignAgent(
        id: String,
        role: String,
        focus: String,
        systemPrompt: String = defaultSystemPrompt,
        modelConfig: Map<String, Any>? = null
    ): Agent {
        val existingAgent = getAgent(id)
        
        return if (existingAgent == null) {
            // Create new agent
            val agent = Agent(id, role, focus, systemPrompt)
            agents[id] = agent
            agent
        } else {
            // Update existing agent
            val updatedAgent = existingAgent.copy(
                role = role,
                focus = focus,
                systemPrompt = systemPrompt
            )
            agents[id] = updatedAgent
            updatedAgent
        }
    }
    
    /**
     * Extracts tool calls from a message content
     */
    fun extractToolCalls(content: String): List<Map<String, String>> {
        return llmTools.extractToolCalls(content)
    }
}