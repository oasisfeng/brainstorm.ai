package ai.brainstorm.core

class Organizer {
    private val discussionRounds = mutableListOf<DiscussionRound>()
    private var currentRound: DiscussionRound? = null
    private val agents = mutableListOf<Agent>()
    
    fun initializeAgents(agentList: List<Agent>) {
        agents.clear()
        agents.addAll(agentList)
    }
    
    fun startNewRound(roundNumber: Int = discussionRounds.size + 1) {
        val newRound = DiscussionRound(roundNumber, agents)
        discussionRounds.add(newRound)
        currentRound = newRound
        currentRound?.startRound()
    }
    
    fun summarizeCurrentRound() {
        currentRound?.let {
            val summary = it.summarize()
            println("Summary of Round ${discussionRounds.size}: $summary")
        }
    }
    
    fun manageDiscussion() {
        // Logic to manage the overall discussion process
        // This could include invoking agents, collecting inputs, etc.
    }
    
    fun getDiscussionHistory(): List<DiscussionRound> {
        return discussionRounds
    }
}