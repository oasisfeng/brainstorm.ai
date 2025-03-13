import { jest } from '@jest/globals';

class MockFileHandle {
  constructor(name = 'test-file.md', content = 'Test file content') {
    this.name = name;
    this._content = content;
  }

  async createWritable() {
    return {
      write: async (content) => {
        this._content = content;
        return Promise.resolve();
      },
      close: async () => Promise.resolve()
    };
  }

  async getFile() {
    return {
      text: async () => Promise.resolve(this._content)
    };
  }
}

// Create a mock window object
const mockWindow = {
  showSaveFilePicker: jest.fn(() => Promise.resolve(new MockFileHandle())),
  showOpenFilePicker: jest.fn(() => Promise.resolve([new MockFileHandle()])),
  showDirectoryPicker: jest.fn(() => Promise.resolve({}))
};

// Export the mock window and MockFileHandle for use in tests
export { mockWindow, MockFileHandle };