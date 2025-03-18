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
            // If prompt override is provided, use that to guide response generation
            promptOverride != null -> generateResponseBasedOnOverride(
                agent,
                promptOverride,
                messageHistory
            )
            
            // Generate responses based on agent role
            agent.id == "organizer" -> generateOrganizerResponse(messageHistory)
            agent.role.contains("Tech", ignoreCase = true) -> generateTechExpertResponse(messageHistory)
            agent.role.contains("Business", ignoreCase = true) -> generateBusinessExpertResponse(messageHistory)
            agent.role.contains("UX", ignoreCase = true) -> generateUXExpertResponse(messageHistory)
            
            // Generic expert response as fallback
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
    
    private fun generateTechExpertResponse(recentMessages: List<Message>): String {
        return """
            From a technical perspective, I see several important considerations:
            
            1. Implementation Feasibility:
               - This concept would require integration with [relevant technology]
               - We should consider using [specific framework/approach] for faster development
               - The technical complexity is moderate, with key challenges in [specific area]
            
            2. Scalability:
               - The architecture should account for [specific scaling needs]
               - We'd need to implement [specific pattern] to ensure performance doesn't degrade
            
            3. Technical Risks:
               - The main concerns would be [specific technical concerns]
               - We could mitigate these by [specific approach]
            
            I believe with proper technical planning, this concept is quite viable.
            
            invokeAgent(id='organizer')
        """.trimIndent()
    }
    
    private fun generateBusinessExpertResponse(recentMessages: List<Message>): String {
        return """
            Looking at this topic from a business perspective:
            
            1. Market Opportunity:
               - The target market segment size is approximately [market size estimate]
               - Key competitors include [competitor examples] who are currently [doing something]
               - Our unique value proposition would be [specific value]
            
            2. Business Model:
               - A [specific model] approach would work well here
               - Revenue streams could include [specific streams]
               - The cost structure would primarily involve [main costs]
            
            3. Go-to-Market Strategy:
               - I recommend initially focusing on [specific segment]
               - Strategic partnerships with [potential partners] would accelerate adoption
            
            Overall, I see strong business potential with proper positioning and execution.
            
            invokeAgent(id='organizer')
        """.trimIndent()
    }
    
    private fun generateUXExpertResponse(recentMessages: List<Message>): String {
        return """
            From a user experience standpoint, this topic presents interesting opportunities:
            
            1. User Needs:
               - The primary user pain points this addresses are [specific pain points]
               - User research suggests that [specific finding]
               - Key user expectations would include [specific expectations]
            
            2. Design Considerations:
               - The interface should prioritize [specific design principles]
               - User flow would need to accommodate [specific user behaviors]
               - Accessibility considerations include [specific considerations]
            
            3. Testing Approach:
               - I recommend [specific testing methodology] to validate our design
               - Key metrics to track would include [specific metrics]
            
            If we center the user in our design process, this concept has excellent potential to deliver a compelling experience.
            
            invokeAgent(id='organizer')
        """.trimIndent()
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