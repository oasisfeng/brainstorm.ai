package ai.brainstorm.core

class DiscussionRound(
    val roundNumber: Int = 0,
    private val agents: List<Agent>,
    private val context: String = ""
) {
    private val agentInputs = mutableListOf<String>()
    private var summary: String = ""
    
    fun startRound() {
        println("Starting discussion round $roundNumber")
        collectInputs()
        summarize()
    }
    
    fun collectInputs() {
        agents.forEach { agent ->
            val input = agent.generateResponse(context)
            agentInputs.add(input)
            println("Agent ${agent.role} responded: $input")
        }
    }
    
    fun summarize(): String {
        summary = agentInputs.joinToString(separator = "\n") { it }
        println("Summary of round $roundNumber:\n$summary")
        return summary
    }
    
    fun getSummary(): String {
        return summary
    }
}