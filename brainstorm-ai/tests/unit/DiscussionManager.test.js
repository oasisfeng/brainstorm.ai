// DiscussionManager.test.js

import { DiscussionManager } from '../../src/js/managers/DiscussionManager';
import { SystemState } from '../../src/js/models/SystemState';
import { Agent } from '../../src/js/models/Agent';
import { Message } from '../../src/js/models/Message';

describe('DiscussionManager', () => {
    let discussionManager;
    let systemState;

    beforeEach(() => {
        systemState = new SystemState();
        discussionManager = new DiscussionManager(systemState);
    });

    test('should initialize with default values', () => {
        expect(discussionManager.currentRound).toBe(0);
        expect(discussionManager.agents).toEqual([]);
    });

    test('should start a new round', () => {
        const agents = [new Agent({ id: '1', role: 'Expert' })];
        discussionManager.startRound('Test Topic', agents, 30);
        
        expect(discussionManager.currentRound).toBe(1);
        expect(discussionManager.agents).toEqual(agents);
    });

    test('should coordinate speaking order', () => {
        const agents = [
            new Agent({ id: '1', role: 'Expert' }),
            new Agent({ id: '2', role: 'Novice' })
        ];
        discussionManager.startRound('Test Topic', agents, 30);
        
        const speakingOrder = discussionManager.coordinateSpeaking();
        expect(speakingOrder).toEqual(agents);
    });

    test('should generate round summary', () => {
        const agents = [new Agent({ id: '1', role: 'Expert' })];
        discussionManager.startRound('Test Topic', agents, 30);
        
        discussionManager.generateSpeech(agents[0], 'This is a test message.');
        const summary = discussionManager.generateRoundSummary();
        
        expect(summary).toContain('This is a test message.');
    });

    test('should handle client intervention', () => {
        const agents = [new Agent({ id: '1', role: 'Expert' })];
        discussionManager.startRound('Test Topic', agents, 30);
        
        discussionManager.handleClientIntervention({ action: 'pause' });
        expect(discussionManager.isPaused).toBe(true);
    });

    afterEach(() => {
        discussionManager = null;
        systemState = null;
    });
});