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

// Ensure proper window initialization
global.window = {
  ...global.window,
  showSaveFilePicker: jest.fn(async () => new MockFileHandle()),
  showOpenFilePicker: jest.fn(async () => [new MockFileHandle()]),
  showDirectoryPicker: jest.fn(async () => ({}))
};

// Also expose the same APIs on global scope for modules that might access them directly
global.showSaveFilePicker = window.showSaveFilePicker;
global.showOpenFilePicker = window.showOpenFilePicker;
global.showDirectoryPicker = window.showDirectoryPicker;