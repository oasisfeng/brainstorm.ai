package ai.brainstorm.core

class BrainstormSession {
    private val agents = mutableListOf<Agent>()
    private val discussionRounds = mutableListOf<DiscussionRound>()
    private var currentRound: DiscussionRound? = null
    private var sessionHistory = mutableListOf<String>()

    fun initializeAgents(agentList: List<Agent>) {
        agents.clear()
        agents.addAll(agentList)
    }

    fun startNewRound(roundNumber: Int = discussionRounds.size + 1, context: String = "") {
        val newRound = DiscussionRound(roundNumber, agents, context)
        discussionRounds.add(newRound)
        currentRound = newRound
        sessionHistory.add("Started new discussion round.")
    }

    fun collectInputs() {
        currentRound?.collectInputs()
    }

    fun summarizeRound() {
        currentRound?.let {
            val summary = it.summarize()
            sessionHistory.add("Round summary: $summary")
        }
    }

    fun getSessionHistory(): List<String> {
        return sessionHistory
    }
    
    fun getAgents(): List<Agent> {
        return agents.toList()
    }
}