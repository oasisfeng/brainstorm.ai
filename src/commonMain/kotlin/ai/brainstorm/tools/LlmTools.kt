package ai.brainstorm.tools

import ai.brainstorm.agent.AgentManager
import ai.brainstorm.model.Agent
import ai.brainstorm.model.Message

/**
 * Handles interactions with language models and processes tool calls
 */
class LlmTools(private val agentManager: AgentManager) {
    
    /**
     * Invokes an agent with the given message history
     */
    fun invokeAgent(
        agentId: String,
        messageHistory: List<Message>,
        promptOverride: String? = null
    ): String {
        val agent = agentManager.getAgent(agentId) ?: return "Error: Agent $agentId not found"
        
        // In a real implementation, this would call the actual LLM API
        // For MVP, we'll simulate LLM responses based on the agent's role
        return simulateLlmResponse(agent, messageHistory, promptOverride)
    }
    
    /**
     * For MVP, simulate LLM responses based on agent role and conversation history
     */
    private fun simulateLlmResponse(agent: Agent, messageHistory: List<Message>, promptOverride: String?): String {
        return when {
            promptOverride != null -> generateResponseBasedOnOverride(
                agent,
                promptOverride,
                messageHistory
            )
            
            agent.id == "organizer" -> generateOrganizerResponse(messageHistory)
            agent.role.contains("Tech", ignoreCase = true) -> {
                val speakingTurn = messageHistory.count { it.sender == agent.role }
                generateTechExpertResponse(messageHistory, speakingTurn)
            }
            agent.role.contains("Business", ignoreCase = true) -> {
                val speakingTurn = messageHistory.count { it.sender == agent.role }
                generateBusinessExpertResponse(messageHistory, speakingTurn)
            }
            agent.role.contains("UX", ignoreCase = true) -> {
                val speakingTurn = messageHistory.count { it.sender == agent.role }
                generateUXExpertResponse(messageHistory, speakingTurn)
            }
            else -> generateGenericExpertResponse(agent, messageHistory)
        }
    }

    private fun generateResponseBasedOnOverride(
        agent: Agent,
        promptOverride: String,
        recentMessages: List<Message>
    ): String {
        // For summary prompt
        if (promptOverride.contains("summarize", ignoreCase = true)) {
            return """
                Here's a summary of our discussion so far about this topic:
                
                1. Key Points:
                   - We've explored several perspectives on the topic
                   - The technical feasibility has been assessed
                   - Business implications have been considered
                   - User experience aspects were highlighted
                
                2. Innovative Ideas:
                   - Integration of AI-driven analytics
                   - User-centric design approach
                   - Sustainable business model
                
                3. Next Steps:
                   - Further exploration of implementation challenges
                   - Market validation of the core concept
                   - Refining the key features based on user needs
                
                Each expert has provided valuable insights. I suggest we focus on [implementation details/market validation/user testing] in our next round.
                
                invokeAgent(id='user')
            """.trimIndent()
        }
        
        // For new round prompt
        if (promptOverride.contains("new round", ignoreCase = true)) {
            return """
                Welcome to our new round of discussion on this topic.
                
                Based on our previous round, I suggest we now focus on how to implement the key ideas we've generated.
                
                Before we continue with our experts, would you like to add any specific points you'd like us to address?
                
                invokeAgent(id='user')
            """.trimIndent()
        }
        
        // Generic response based on override
        return "Based on your instruction to \"${promptOverride.take(30)}...\", I'm providing this response as ${agent.role}.\n\ninvokeAgent(id='organizer')"
    }
    
    private fun generateOrganizerResponse(messages: List<Message>): String {
        if (messages.isEmpty()) return "Please provide a topic to start brainstorming.\ninvokeAgent(id='user')"
        // Different responses based on the conversation stage
        return when {
            messages.size <= 2 -> {
                // Initial planning phase after receiving the topic
                """
                Thank you for providing the topic. Let's structure our brainstorming session.
                
                I'll assign a few experts to help with this discussion:
                
                assignAgent(id='tech_expert', role='Technology Expert', focus='Technical feasibility and implementation', systemPrompt='You are a technology expert helping with brainstorming.')
                assignAgent(id='business_expert', role='Business Analyst', focus='Market viability and business models', systemPrompt='You are a business analyst helping with brainstorming.')
                assignAgent(id='ux_expert', role='UX Designer', focus='User experience and interface design', systemPrompt='You are a UX designer helping with brainstorming.')
                
                Let's start our first round of discussion:
                
                invokeAgent(id='tech_expert')
                invokeAgent(id='business_expert')
                invokeAgent(id='ux_expert')
                invokeAgent(id='tech_expert')
                invokeAgent(id='business_expert')
                invokeAgent(id='ux_expert')
                invokeAgent(id='tech_expert')
                invokeAgent(id='business_expert')
                invokeAgent(id='ux_expert')
                """.trimIndent()
            }
            messages.any { it.sender == "Technology Expert" || it.sender == "Tech Expert" } && 
            !messages.any { it.sender == "Business Analyst" || it.sender == "Business Expert" } -> {
                // After tech expert, call business expert
                """
                Thank you for that technical perspective. These are important considerations.
                
                Let's now hear from our business expert to understand the market implications.
                """.trimIndent()
            }
            messages.any { it.sender == "Business Analyst" || it.sender == "Business Expert" } &&
            !messages.any { it.sender == "UX Designer" || it.sender == "UX Expert" } -> {
                // After business expert, call UX expert
                """
                Those are valuable business insights. Now let's consider the user perspective.
                
                invokeAgent(id='ux_expert')
                """.trimIndent()
            }
            else -> {
                // After hearing from all experts, summarize and involve the user
                """
                Thank you all for your valuable insights. We've heard technical, business, and user experience perspectives on this topic.
                
                I'd like to check if our user has any thoughts or questions before we continue deeper into this discussion.
                
                invokeAgent(id='user')
                """.trimIndent()
            }
        }
    }
    
    private fun generateTechExpertResponse(recentMessages: List<Message>, turn: Int): String {
        return when (turn) {
            0 -> """
                From an initial technical assessment:
                
                1. Core Architecture:
                   - Recommend a microservices-based approach for flexibility
                   - Need to evaluate cloud vs. on-premise hosting
                   - Initial focus on critical APIs and data models
                
                2. Technology Stack:
                   - Modern web technologies (Kotlin/JS, React) for frontend
                   - Kotlin backend for type safety and coroutines support
                   - PostgreSQL for data persistence with room to scale
                
                Let's start with this foundation and iterate based on requirements.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            1 -> """
                After considering the initial feedback, here are technical details:
                
                1. Security Considerations:
                   - OAuth2 for authentication
                   - End-to-end encryption for sensitive data
                   - Regular security audits built into CI/CD
                
                2. Performance Optimizations:
                   - Caching layer with Redis
                   - CDN for static assets
                   - Lazy loading for better initial load times
                
                These technical choices align well with our scalability goals.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            else -> """
                Building on previous discussions, here are advanced technical considerations:
                
                1. System Resilience:
                   - Circuit breakers for external service calls
                   - Retry mechanisms with exponential backoff
                   - Comprehensive logging and monitoring
                
                2. DevOps Strategy:
                   - Containerization with Kubernetes
                   - Automated deployment pipelines
                   - Blue-green deployment strategy
                
                This should give us a robust, production-ready system.
                
                invokeAgent(id='organizer')
            """.trimIndent()
        }
    }

    private fun generateBusinessExpertResponse(recentMessages: List<Message>, turn: Int): String {
        return when (turn) {
            0 -> """
                Initial business analysis shows:
                
                1. Market Size:
                   - Total addressable market: $500M annually
                   - Initial target segment: Mid-sized enterprises
                   - Expected market penetration: 2-3% in year 1
                
                2. Competition:
                   - 3 major players in the space
                   - Current solutions lack AI integration
                   - Entry barriers are moderate
                
                The timing appears favorable for market entry.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            1 -> """
                Diving deeper into business strategy:
                
                1. Revenue Model:
                   - Subscription-based pricing
                   - Tiered features with enterprise options
                   - Professional services revenue stream
                
                2. Growth Strategy:
                   - Focus on key verticals initially
                   - Strategic partnerships with system integrators
                   - Content marketing and thought leadership
                
                These approaches should maximize our market opportunity.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            else -> """
                Focusing on execution strategy:
                
                1. Go-to-Market Timeline:
                   - Beta launch in Q3
                   - Full market release in Q4
                   - International expansion in Year 2
                
                2. Key Performance Indicators:
                   - Customer acquisition cost < $5000
                   - Monthly churn rate < 2%
                   - Net revenue retention > 120%
                
                This positions us for sustainable growth.
                
                invokeAgent(id='organizer')
            """.trimIndent()
        }
    }

    private fun generateUXExpertResponse(recentMessages: List<Message>, turn: Int): String {
        return when (turn) {
            0 -> """
                Initial UX assessment reveals:
                
                1. User Research Findings:
                   - Users struggle with complex workflows
                   - Mobile access is a critical requirement
                   - Integration with existing tools is key
                
                2. Design Principles:
                   - Progressive disclosure of features
                   - Consistent interaction patterns
                   - Clear visual hierarchy
                
                These insights will guide our initial design direction.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            1 -> """
                Expanding on the user experience strategy:
                
                1. Information Architecture:
                   - Three-level navigation hierarchy
                   - Task-based organization
                   - Contextual help system
                
                2. Interaction Design:
                   - Gesture-based interactions for mobile
                   - Real-time collaboration features
                   - Inline editing capabilities
                
                This framework provides both power and simplicity.
                
                invokeAgent(id='organizer')
            """.trimIndent()
            
            else -> """
                Detailing the final UX implementation plan:
                
                1. User Testing Strategy:
                   - Remote usability testing
                   - A/B testing for key features
                   - Analytics integration
                
                2. Accessibility Considerations:
                   - WCAG 2.1 AA compliance
                   - Screen reader optimization
                   - Keyboard navigation support
                
                This ensures a universally accessible product.
                
                invokeAgent(id='organizer')
            """.trimIndent()
        }
    }

    private fun generateGenericExpertResponse(agent: Agent, recentMessages: List<Message>): String {
        return """
            As a ${agent.role} focused on ${agent.focus}, I have several thoughts:
            
            1. ${agent.focus} Perspective:
               - This concept has implications for [specific area related to focus]
               - The approach should consider [specific considerations]
               - Based on my expertise, I recommend [specific recommendation]
            
            2. Opportunities:
               - There's particular potential in [specific opportunity]
               - We could enhance the concept by [specific enhancement]
            
            3. Challenges:
               - We should be mindful of [specific challenge]
               - This can be addressed by [specific solution]
            
            I hope these insights from my ${agent.focus} perspective are valuable to the discussion.
            
            invokeAgent(id='organizer')
        """.trimIndent()
    }
    
    /**
     * Extracts tool calls from a message content
     * In a real implementation, this would use more sophisticated parsing
     */
    fun extractToolCalls(content: String): List<Map<String, String>> {
        val toolCalls = mutableListOf<Map<String, String>>()
        
        // Simple regex-based extraction for MVP
        // In a real implementation, this would use more sophisticated parsing
        
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