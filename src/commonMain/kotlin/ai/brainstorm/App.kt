package ai.brainstorm

import ai.brainstorm.controller.MainController
import ai.brainstorm.agent.AgentManager
import ai.brainstorm.config.ConfigManager

fun createApp(): MainController {
    val systemPrompt = "You are an AI assistant helping with brainstorming." // Default system prompt
    val agentManager = AgentManager(systemPrompt)
    val configManager = ConfigManager()
    return MainController(agentManager, configManager)
}

fun main() {
    val mainController = createApp()
    mainController.startDiscussion()
}