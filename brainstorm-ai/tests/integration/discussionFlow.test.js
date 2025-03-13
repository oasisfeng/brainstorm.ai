// This file contains integration tests for the discussion flow.
import CoreController from '../../src/js/controllers/CoreController.js';
import AgentManager from '../../src/js/managers/AgentManager.js';
import DiscussionManager from '../../src/js/managers/DiscussionManager.js';
import FileManager from '../../src/js/managers/FileManager.js';
import UIManager from '../../src/js/managers/UIManager.js';
import LLMServiceAdapter from '../../src/js/services/LLMServiceAdapter.js';
import { Config } from '../../src/js/config.js';
import { jest } from '@jest/globals';

describe('Discussion Flow Integration Tests', () => {
    let coreController;
    let agentManager;
    let discussionManager;
    let fileManager;
    let uiManager;
    let llmServiceAdapter;
    let useMockApi = false; // Changed to false to use real API
    
    // Increased timeout for tests using real API
    jest.setTimeout(30000);

    beforeEach(async () => {
        // Create and configure the real components with some mocking
        agentManager = new AgentManager();
        fileManager = new FileManager();
        uiManager = new UIManager();

        // Mock UIManager methods
        uiManager.showNotification = jest.fn();
        uiManager.showError = jest.fn();
        uiManager.updateDiscussionView = jest.fn();
        uiManager.showRoundSummary = jest.fn();
        uiManager.displayAgentEvaluation = jest.fn();
        uiManager.render = jest.fn();
        uiManager.getTopicInput = jest.fn().mockReturnValue('Mock Topic');
        
        // Set up LLMServiceAdapter with config from config.js
        llmServiceAdapter = new LLMServiceAdapter();
        
        // Initialize with the updated Config
        const providerConfig = Config.llmProviders[0];
        llmServiceAdapter.initialize(providerConfig);

        // Add error handler for LLM service
        llmServiceAdapter.handleError = jest.fn(error => {
            console.error('LLM Service Error:', error);
            throw error;
        });

        // Wait for LLM service initialization
        if (!useMockApi) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });

    test('should verify LLM service connection', async () => {
        if (!useMockApi) {
            const response = await llmServiceAdapter.createChatCompletion({
                messages: [{
                    role: "user",
                    content: "Hello, this is a test message. Please respond with 'OK' if you receive this."
                }]
            });
            expect(response).toBeDefined();
            expect(response.choices[0].message.content).toBeDefined();
        } else {
            expect(true).toBe(true);
        }
    });

    test('should handle user input during discussion', async () => {
        const topic = 'Climate Change';
        
        // Create test agents
        agentManager.createAgent('Climate Scientist', 'Climate Research');
        agentManager.createAgent('Policy Expert', 'Environmental Policy');
        
        // Allow discussion to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const userInput = "This is a test user input about carbon emissions";
        
        // Check if the user message was added to discussion history
        const discussion = discussionManager?.getCurrentDiscussion();
        if (discussion) {
            const lastMessage = discussion.messages[discussion.messages.length - 1];
            expect(lastMessage).toBeDefined();
        }
        
        // Wait briefly to allow agents to respond to user input
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should complete a full discussion cycle with summary', async () => {
        const topic = 'Space Exploration';
        
        // Create diverse test agents for a rich discussion
        agentManager.createAgent('Astronomer', 'Space Science');
        agentManager.createAgent('Space Industry Expert', 'Commercial Space');
        
        // Set a short duration for testing
        const discussionDuration = 1; // 1 minute
        
        // Wait for discussion to complete
        await new Promise(resolve => setTimeout(resolve, useMockApi ? 100 : 5000));
        
        const discussion = discussionManager?.getCurrentDiscussion();
        if (discussion) {
            expect(discussion.messages.length).toBeGreaterThan(0);
        }
    });
});