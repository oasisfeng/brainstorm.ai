// This file contains unit tests for the AgentManager class.

import { AgentManager } from '../../src/js/managers/AgentManager';
import { Agent } from '../../src/js/models/Agent';

describe('AgentManager', () => {
    let agentManager;

    beforeEach(() => {
        agentManager = new AgentManager();
    });

    test('should create an agent with the correct properties', () => {
        const role = 'Economist';
        const specialty = 'Economics';
        const agent = agentManager.createAgent(role, specialty);

        expect(agent).toBeInstanceOf(Agent);
        expect(agent.role).toBe(role);
        expect(agent.specialty).toBe(specialty);
    });

    test('should generate a system prompt for an agent', () => {
        const role = 'Technician';
        const specialty = 'Technology';
        const agent = agentManager.createAgent(role, specialty);
        const prompt = agentManager.generateSystemPrompt(role, specialty);

        expect(prompt).toContain(`你是一个名为${agent.id}的专家，专长领域是${specialty}。`);
    });

    test('should evaluate agent performance correctly', () => {
        const agent = agentManager.createAgent('Engineer', 'Engineering');
        const discussion = { roundId: 1, messages: [], summary: '', agentEvaluations: {} };
        
        agentManager.evaluateAgentPerformance(agent.id, discussion);
        
        expect(discussion.agentEvaluations[agent.id]).toBeDefined();
    });

    test('should select agents for the next round based on topic', () => {
        agentManager.createAgent('Economist', 'Economics');
        agentManager.createAgent('Technician', 'Technology');
        
        const selectedAgents = agentManager.selectAgentsForNextRound('Economics');

        expect(selectedAgents.length).toBeGreaterThan(0);
    });

    test('should remove an agent by ID', () => {
        const agent = agentManager.createAgent('Scientist', 'Science');
        agentManager.removeAgent(agent.id);
        
        expect(agentManager.getAgentById(agent.id)).toBeUndefined();
    });
});