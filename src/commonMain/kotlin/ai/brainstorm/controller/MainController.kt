package ai.brainstorm.controller

import ai.brainstorm.agent.AgentManager
import ai.brainstorm.agent.AgentManager.Companion.ORGANIZER
import ai.brainstorm.agent.AgentManager.Companion.USER
import ai.brainstorm.model.Message
import ai.brainstorm.config.ConfigManager
import ai.brainstorm.prompts.PromptManager
import ai.brainstorm.prompts.WorkflowTextManager

class MainController(
    private val agentManager: AgentManager, 
    private val configManager: ConfigManager
) {
    private val messageHistory = mutableListOf<Message>()
    private var currentRound = 0
    private val promptManager = PromptManager()
    private val workflowTextManager = WorkflowTextManager()
    private var currentTopic: String = ""
    private val pendingAgentInvocations = mutableListOf<String>()
    private var processingAgents = false
    
    fun startDiscussion() {
        currentRound = 1

        // Create the organizer agent if it doesn't exist
        val organizerPrompt = promptManager.getOrganizerSystemPrompt()
        agentManager.assignAgent(
            id = ORGANIZER,
            role = "Discussion Organizer",
            focus = "Facilitate and guide the brainstorming session",
            systemPrompt = organizerPrompt
        )

        // Start the discussion by invoking the organizer
        requestAgentInvocation(ORGANIZER)
    }

    private fun requestAgentInvocation(agentId: String) {
        // Add the agent to the queue and process if not already processing
        pendingAgentInvocations.add(agentId)
        
        if (! processingAgents) {
            processingAgents = true
            processAgentQueue()
            processingAgents = false
        }
    }
    
    private fun processAgentQueue() {
        while (pendingAgentInvocations.isNotEmpty()) {
            val agentId = pendingAgentInvocations.removeAt(0)
            val response = invokeAgent(agentId)
            if (response != null) {
                addMessage(response)
                if (agentId == ORGANIZER)
                    processToolCallsForOrganizer(response.content)
            }
        }
    }
    
    private fun invokeAgent(agentId: String): Message? {
        if (agentId == USER)
            return handleUserInput()

        val agent = agentManager.getAgent(agentId)
            ?: return null.also { println("Skipped missing agent: $agentId") }

        val response = agentManager.invokeAgentWithHistory(agentId, messageHistory)

        val senderName = if (agentId == ORGANIZER) "Organizer" else agent.role
        return Message(sender = senderName, content = response)
    }

    private fun processToolCallsForOrganizer(content: String) {
        // Extract all tool calls from the content
        val toolCalls = agentManager.extractToolCalls(content)
        
        if (toolCalls.isEmpty()) {
            // If no explicit tool calls, check for common patterns
            if (content.contains("invokeAgent(id='user')", ignoreCase = true)) {
                handleUserInput()
                return
            } else if (content.contains("invokeAgent(id='self')", ignoreCase = true)) {
                pendingAgentInvocations.add(ORGANIZER)
                return
            }
        }
        
        // Process extracted tool calls
        for (tool in toolCalls) {
            when (tool["tool"]) {
                "assignAgent" -> {
                    val id = tool["id"] ?: continue
                    val role = tool["role"] ?: continue
                    val focus = tool["focus"] ?: continue
                    
                    // Use the prompt manager to get appropriate system prompt
                    var systemPrompt = tool["systemPrompt"] 
                    if (systemPrompt.isNullOrBlank())
                        systemPrompt = promptManager.getExpertPrompt(role, focus, currentTopic)
                    
                    agentManager.assignAgent(id, role, focus, systemPrompt)
                    
                    println("Agent created/updated: $role (focused on $focus)")
                }
                "invokeAgent" -> {
                    val id = tool["id"] ?: continue
                    requestAgentInvocation(if (id == "self") ORGANIZER else id)
                }
            }
        }
    }

    /** @return null to end the brainstorming session */
    private fun handleUserInput(): Message? {
        /**
         * Handle user input as a special "user" agent
         *
         * @return The user's input as a string
         */
        val userInput = readLine() ?: ""

        // Check for special commands
        if (userInput.equals("exit", ignoreCase = true)) {
            println("Ending brainstorming session.")
            return null
        }

        // Let organizer handle the user input
        pendingAgentInvocations.add(ORGANIZER)
        return Message(sender = "User", content = userInput)
    }

    private fun addMessage(message: Message) {
        messageHistory.add(message)
        println("[${message.sender}]: ${message.content}")
    }
}