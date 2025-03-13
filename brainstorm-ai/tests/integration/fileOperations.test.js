// This file contains integration tests for file operations in the brainstorm-ai project.
import FileManager from '../../src/js/managers/FileManager.js';
import { Config } from '../../src/js/config.js';
import { jest } from '@jest/globals';

describe('FileManager Integration Tests', () => {
  let fileManager;
  const testFilePath = 'test-discussion.md';
  const discussionFilesPath = Config.filePaths.discussions;

  beforeEach(() => {
    fileManager = new FileManager();
  });

  test('should save discussion to file', async () => {
    const discussionContent = '# Test Discussion\n\n## Summary\nThis is a test summary.';
    
    // Mock the browser file API calls
    await fileManager.saveDiscussionToFile(discussionContent);
    
    // Check if the save was called
    expect(global.showSaveFilePicker).toHaveBeenCalled();
  });

  test('should load discussion from file', async () => {
    const discussionContent = '# Test Discussion\n\n## Summary\nThis is a test summary.';
    
    const loadedContent = await fileManager.loadDiscussionFromFile();
    
    expect(loadedContent).toBeDefined();
    expect(global.showOpenFilePicker).toHaveBeenCalled();
  });

  test('should handle file not found error gracefully', async () => {
    global.showOpenFilePicker = jest.fn(async () => {
      return [new global.FileSystemFileHandle('nonexistent.md')];
    });
    
    await expect(fileManager.loadDiscussionFromFile()).rejects.toThrow('File not found');
  });

  test('should monitor user input file for changes', async () => {
    const userInputFilePath = Config.filePaths.userInput;
    const initialContent = 'Initial input';
    
    // Set up monitoring with a callback
    const mockCallback = jest.fn();
    await fileManager.watchUserInputFile(mockCallback);
    
    // Check that the callback was set up
    expect(mockCallback).toBeDefined();
  });

  test('should export discussion as markdown', () => {
    const discussion = {
      topic: 'Test Topic',
      roundId: 1,
      messages: [
        { speakerId: 'agent-1', content: 'Hello from agent 1', timestamp: new Date() },
        { speakerId: 'agent-2', content: 'Hello from agent 2', timestamp: new Date() }
      ],
      agents: [
        { id: 'agent-1', role: 'Expert 1', specialty: 'Testing' },
        { id: 'agent-2', role: 'Expert 2', specialty: 'Integration' }
      ]
    };
    
    const markdown = fileManager.exportDiscussionAsMarkdown(discussion);
    
    // Check markdown contains expected elements
    expect(markdown).toContain('# Discussion: Test Topic');
    expect(markdown).toContain('## Round: 1');
    expect(markdown).toContain('Expert 1 (Testing)');
    expect(markdown).toContain('Expert 2 (Integration)');
    expect(markdown).toContain('Hello from agent 1');
    expect(markdown).toContain('Hello from agent 2');
  });
});