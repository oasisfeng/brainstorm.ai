// File: /brainstorm-ai/brainstorm-ai/tests/unit/FileManager.test.js

import { jest } from '@jest/globals';
import { FileManager } from '../../src/js/managers/FileManager';

const logTiming = (operation) => {
  console.log(`[${new Date().toISOString()}] TEST: ${operation}`);
};

class MockFileHandle {
  constructor(content = 'Test file content') {
    this._content = content;
  }

  async createWritable() {
    return {
      write: async (content) => {
        this._content = content;
      },
      close: async () => {}
    };
  }

  async getFile() {
    return {
      text: async () => this._content
    };
  }
}

describe('FileManager', () => {
    let fileManager;
    let mockFileSystemAPI;

    beforeEach(() => {
        logTiming('beforeEach started');
        mockFileSystemAPI = {
            showSaveFilePicker: jest.fn().mockResolvedValue(new MockFileHandle()),
            showOpenFilePicker: jest.fn().mockResolvedValue([new MockFileHandle()]),
            showDirectoryPicker: jest.fn().mockResolvedValue({})
        };
        fileManager = new FileManager(mockFileSystemAPI);
        logTiming('beforeEach completed - FileManager instantiated');
    });

    test('should save discussion to file', async () => {
        logTiming('save discussion test started');
        const discussion = {
            roundId: 1,
            startTime: new Date(),
            endTime: new Date(),
            messages: [],
            summary: '',
            agentEvaluations: {}
        };
        
        logTiming('calling saveDiscussionToFile');
        const result = await fileManager.saveDiscussionToFile(discussion);
        logTiming('saveDiscussionToFile completed');
        
        expect(result).toBe(true);
        expect(mockFileSystemAPI.showSaveFilePicker).toHaveBeenCalled();
    });

    test('should load discussion from file', async () => {
        logTiming('load discussion test started');
        
        logTiming('calling loadDiscussionFromFile');
        const discussion = await fileManager.loadDiscussionFromFile();
        logTiming('loadDiscussionFromFile completed');
        
        expect(discussion).toBeDefined();
        expect(typeof discussion).toBe('string');
        expect(discussion).toBe('Test file content');
        expect(mockFileSystemAPI.showOpenFilePicker).toHaveBeenCalled();
    });

    test('should monitor user input file', async () => {
        logTiming('monitor file test started');
        const mockCallback = jest.fn();
        
        logTiming('calling watchUserInputFile');
        const unwatch = await fileManager.watchUserInputFile(mockCallback);
        logTiming('watchUserInputFile completed');
        
        expect(typeof unwatch).toBe('function');
    });

    test('should clear user input file', async () => {
        logTiming('clear file test started');
        
        logTiming('calling clearUserInputFile');
        await fileManager.clearUserInputFile();
        logTiming('clearUserInputFile completed');
        
        await expect(fileManager.clearUserInputFile()).resolves.not.toThrow();
    });

    test('should save and load configuration', async () => {
        logTiming('config test started');
        const config = { key: 'value' };
        
        logTiming('calling saveConfig');
        await fileManager.saveConfig(config);
        logTiming('saveConfig completed');
        
        logTiming('calling loadConfig');
        const loadedConfig = await fileManager.loadConfig();
        logTiming('loadConfig completed');
        
        expect(loadedConfig).toEqual(config);
    });
});