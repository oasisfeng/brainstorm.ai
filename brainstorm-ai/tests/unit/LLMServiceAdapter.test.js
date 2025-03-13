// This file contains unit tests for the LLMServiceAdapter class.

import { LLMServiceAdapter } from '../../src/js/services/LLMServiceAdapter';

describe('LLMServiceAdapter', () => {
    let adapter;

    beforeEach(() => {
        adapter = new LLMServiceAdapter();
    });

    test('should initialize with default configuration', () => {
        expect(adapter.config).toBeDefined();
        expect(adapter.apiKey).toBe('');
        expect(adapter.apiUrl).toBe('');
    });

    test('should send prompt and receive response', async () => {
        const mockResponse = { choices: [{ text: 'Test response' }] };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockResponse),
            })
        );

        const response = await adapter.sendPrompt('Test prompt', {});
        expect(response).toEqual('Test response');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should handle API errors gracefully', async () => {
        global.fetch = jest.fn(() =>
            Promise.reject(new Error('API error'))
        );

        await expect(adapter.sendPrompt('Test prompt', {})).rejects.toThrow('API error');
    });

    test('should get available models', async () => {
        const mockModels = { models: ['gpt-4', 'gpt-3.5-turbo'] };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockModels),
            })
        );

        const models = await adapter.getAvailableModels();
        expect(models).toEqual(['gpt-4', 'gpt-3.5-turbo']);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});