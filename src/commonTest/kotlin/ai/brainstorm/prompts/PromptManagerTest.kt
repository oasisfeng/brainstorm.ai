package ai.brainstorm.prompts

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PromptManagerTest {
    
    private val promptManager = PromptManager()
    
    @Test
    fun testGetOrganizerSystemPrompt() {
        val prompt = promptManager.getOrganizerSystemPrompt()
        assertTrue(prompt.isNotBlank(), "Organizer system prompt should not be blank")
        assertTrue(prompt.contains("You are an advanced AI system"), "Prompt should contain proper introduction")
        assertTrue(prompt.contains("assignAgent"), "Prompt should describe assignAgent tool")
        assertTrue(prompt.contains("invokeAgent"), "Prompt should describe invokeAgent tool")
    }
    
    @Test
    fun testGetExpertPrompt() {
        val role = "AI Researcher"
        val focus = "Large Language Models"
        val topic = "Future of AI assistants"
        
        val prompt = promptManager.getExpertPrompt(role, focus, topic)
        
        assertTrue(prompt.contains(role), "Prompt should include the role")
        assertTrue(prompt.contains(focus), "Prompt should include the focus")
        assertTrue(prompt.contains(topic), "Prompt should include the topic")
        assertTrue(prompt.contains("professional insights"), "Prompt should include expert guidance")
    }
    
    @Test
    fun testGetSpecializedExpertPrompt() {
        val topic = "E-commerce platform design"
        
        // Test for existing specialized prompt
        val techPrompt = promptManager.getSpecializedExpertPrompt("tech", topic)
        assertTrue(techPrompt.contains("technology expert"), "Tech prompt should reference technology expertise")
        assertTrue(techPrompt.contains(topic), "Tech prompt should include the topic")
        
        // Test for non-existent specialized prompt (should fall back to template)
        val randomPrompt = promptManager.getSpecializedExpertPrompt("nonexistent", topic)
        // The fallback template will have unreplaced {role} and {focus} placeholders
        assertTrue(randomPrompt.contains("{role}"), "Non-existent specialized prompt should contain {role} placeholder")
        assertTrue(randomPrompt.contains("{focus}"), "Non-existent specialized prompt should contain {focus} placeholder")
        assertTrue(randomPrompt.contains(topic), "Prompt should still include the topic")
    }
    
    @Test
    fun testWorkflowPrompt() {
        val replacements = mapOf(
            "topic" to "Smart Home Automation",
            "round" to "2"
        )
        
        val planningPrompt = promptManager.getWorkflowPrompt("planning", replacements)
        
        assertTrue(planningPrompt.contains("Smart Home Automation"), "Planning prompt should contain the topic")
        assertTrue(planningPrompt.contains("plan this round"), "Planning prompt should reference planning phase")
        
        // Test with empty replacements
        val openingPrompt = promptManager.getWorkflowPrompt("opening", emptyMap())
        assertTrue(openingPrompt.contains("brainstorming session"), "Opening prompt should reference brainstorming")
    }
    
    @Test
    fun testSetAndGetPrompt() {
        val key = "test.custom.prompt"
        val value = "This is a custom test prompt"
        
        promptManager.setPrompt(key, value)
        assertEquals(value, promptManager.getPrompt(key), "Retrieved prompt should match set prompt")
        
        // Test non-existent prompt
        val nonExistentPrompt = promptManager.getPrompt("non.existent.key")
        assertTrue(nonExistentPrompt.contains("No prompt found"), "Non-existent prompt should return error message")
    }
}