// AgentManager.kt
package ai.brainstorm.agent

import ai.brainstorm.model.Agent

class AgentManager(private val defaultSystemPrompt: String) {
    private val agents: MutableMap<String, Agent> = mutableMapOf()
    
    fun createAgent(id: String, role: String, focus: String, systemPrompt: String = defaultSystemPrompt): Agent {
        val agent = Agent(id, role, focus, systemPrompt)
        agents[id] = agent
        return agent
    }

    fun updateAgent(id: String, role: String? = null, focus: String? = null) {
        agents[id]?.let { agent ->
            agents[id] = agent.withUpdates(role, focus)
        }
    }

    fun invokeAgent(id: String): Agent? {
        return agents[id]
    }

    fun getAllAgents(): List<Agent> {
        return agents.values.toList()
    }
}