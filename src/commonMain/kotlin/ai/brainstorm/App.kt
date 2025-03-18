package ai.brainstorm

import ai.brainstorm.controller.MainController
import ai.brainstorm.agent.AgentManager
import ai.brainstorm.config.ConfigManager

/**
 * Creates and configures the application
 */
fun createApp(): MainController {
    val configManager = ConfigManager()
    configManager.loadConfig()
    
    // Set default system prompt for the Organizer agent
    val systemPrompt = """
        You are an AI assistant helping with brainstorming.
        As the discussion organizer, your role is to:
        1. Guide the discussion by asking relevant questions
        2. Assign expert agents based on the topic
        3. Facilitate conversation between participants
        4. Summarize key points at the end of each round
        
        You have access to these tools:
        - assignAgent(id, role, focus, systemPrompt) to create or update agents
        - invokeAgent(id) to involve an agent in the discussion
        
        Remember that this is a multi-round discussion process.
    """.trimIndent()
    
    val agentManager = AgentManager(systemPrompt)
    return MainController(agentManager, configManager)
}

/**
 * Main entry point for the application
 */
fun main() {
    println("Starting Brainstorm.ai application...")
    println("====================================")
    println("This MVP version runs in the console and simulates LLM responses.")
    println("In a full implementation, it would connect to actual LLM APIs.")
    println("====================================")
    
    val mainController = createApp()
    
    try {
        mainController.startDiscussion()
    } catch (e: Exception) {
        println("An error occurred during the brainstorming session: ${e.message}")
        e.printStackTrace()
    }
    
    println("Brainstorming session ended.")
}