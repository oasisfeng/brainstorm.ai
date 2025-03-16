package ai.brainstorm.shell

import ai.brainstorm.core.BrainstormSession
import ai.brainstorm.core.Agent
import java.util.Scanner

class ShellUserInterface(private val session: BrainstormSession) {
    private val scanner = Scanner(System.`in`)
    
    fun start() {
        println("Welcome to the Brainstorming System!")
        println("Type 'exit' to quit the application.")
        
        // 初始化一些默认的智能体
        setupDefaultAgents()
        
        while (true) {
            print("> ")
            val input = scanner.nextLine()
            if (input.equals("exit", ignoreCase = true)) {
                println("Exiting the brainstorming session. Goodbye!")
                break
            }
            handleInput(input)
        }
    }
    
    private fun setupDefaultAgents() {
        val defaultAgents = listOf(
            Agent("1", "思想家", "创造性思维", "gpt-4"),
            Agent("2", "批评者", "逻辑分析", "gpt-4"),
            Agent("3", "实用主义者", "实际应用", "gpt-4")
        )
        session.initializeAgents(defaultAgents)
        println("Default agents initialized.")
    }
    
    private fun handleInput(input: String) {
        when {
            input.startsWith("start") -> {
                val topic = input.removePrefix("start").trim()
                if (topic.isNotEmpty()) {
                    session.startNewRound(context = topic)
                    println("New discussion round started with topic: $topic")
                } else {
                    session.startNewRound()
                    println("New discussion round started.")
                }
                session.collectInputs()
            }
            input.startsWith("add agent") -> {
                val agentInfo = input.removePrefix("add agent").trim().split(",")
                if (agentInfo.size >= 3) {
                    val agent = Agent(
                        id = agentInfo[0].trim(),
                        role = agentInfo[1].trim(),
                        focus = agentInfo[2].trim(),
                        model = if (agentInfo.size > 3) agentInfo[3].trim() else "gpt-4"
                    )
                    session.initializeAgents(session.getAgents() + agent)
                    println("Agent added: ${agent.role} focused on ${agent.focus}")
                } else {
                    println("Invalid agent format. Use: add agent id, role, focus, [model]")
                }
            }
            input.startsWith("summary") -> {
                session.summarizeRound()
                val history = session.getSessionHistory()
                if (history.isNotEmpty()) {
                    println("Current Discussion Summary:")
                    history.forEach { println(it) }
                } else {
                    println("No discussion has taken place yet.")
                }
            }
            else -> {
                println("Unknown command. Please try again.")
            }
        }
    }
}