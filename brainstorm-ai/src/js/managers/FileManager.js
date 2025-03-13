import { Config } from '../config.js';

class FileManager {
    constructor(fileSystemAPI = {}) {
        this.userInputFilePath = Config.filePaths.userInput;
        this.discussionFilePath = Config.filePaths.discussions;
        this.configFilePath = Config.filePaths.config;
        this.fileHandles = {};
        this.fileWatchers = {};
        
        // Use provided API functions or fallback to window methods
        this.showDirectoryPicker = fileSystemAPI.showDirectoryPicker || 
            (() => window.showDirectoryPicker());
        this.showSaveFilePicker = fileSystemAPI.showSaveFilePicker || 
            ((options) => window.showSaveFilePicker(options));
        this.showOpenFilePicker = fileSystemAPI.showOpenFilePicker || 
            ((options) => window.showOpenFilePicker(options));
    }

    async requestFileSystemAccess() {
        try {
            const dirHandle = await this.showDirectoryPicker();
            return dirHandle;
        } catch (error) {
            console.error('Error requesting file system access:', error);
            throw new Error('Failed to get file system access: ' + error.message);
        }
    }

    async saveDiscussionToFile(discussionContent) {
        try {
            const fileHandle = await this.showSaveFilePicker({
                suggestedName: 'discussion.md',
                types: [{
                    description: 'Markdown files',
                    accept: { 'text/markdown': ['.md'] }
                }],
            });
            const writable = await fileHandle.createWritable();
            await writable.write(discussionContent);
            await writable.close();
            return true;
        } catch (error) {
            console.error('Error saving discussion to file:', error);
            throw new Error('Failed to save discussion: ' + error.message);
        }
    }

    async loadDiscussionFromFile() {
        try {
            const [fileHandle] = await this.showOpenFilePicker({
                types: [{
                    description: 'Markdown files',
                    accept: { 'text/markdown': ['.md'] }
                }],
                multiple: false
            });
            const file = await fileHandle.getFile();
            const content = await file.text();
            return content;
        } catch (error) {
            console.error('Error loading discussion from file:', error);
            throw new Error('File not found');
        }
    }

    async watchUserInputFile(callback) {
        try {
            this.fileWatchers[this.userInputFilePath] = callback;
            return () => {
                delete this.fileWatchers[this.userInputFilePath];
            };
        } catch (error) {
            console.error('Error watching user input file:', error);
            throw new Error('Failed to watch file: ' + error.message);
        }
    }

    async readUserInputFile() {
        try {
            if (this.fileHandles[this.userInputFilePath]) {
                const file = await this.fileHandles[this.userInputFilePath].getFile();
                return await file.text();
            }
            return '';
        } catch (error) {
            console.error('Error reading user input file:', error);
            return '';
        }
    }

    async clearUserInputFile() {
        try {
            if (this.fileHandles[this.userInputFilePath]) {
                const writable = await this.fileHandles[this.userInputFilePath].createWritable();
                await writable.write('');
                await writable.close();
            }
        } catch (error) {
            console.error('Error clearing user input file:', error);
        }
    }

    async saveConfig(config) {
        try {
            const configJson = JSON.stringify(config, null, 2);
            this.configContent = configJson;
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    async loadConfig() {
        try {
            if (this.configContent) {
                return JSON.parse(this.configContent);
            }
            return Config;
        } catch (error) {
            console.error('Error loading config:', error);
            return null;
        }
    }

    exportDiscussionAsMarkdown(discussion) {
        let content = `# Discussion: ${discussion.topic}\n\n`;
        content += `## Round: ${discussion.roundId}\n\n`;
        
        content += `## Participating Agents\n\n`;
        discussion.agents.forEach(agent => {
            content += `- ${agent.role} (${agent.specialty})\n`;
        });
        content += '\n';
        
        content += `## Discussion Content\n\n`;
        discussion.messages.forEach(message => {
            const agent = discussion.agents.find(a => a.id === message.speakerId);
            const speakerName = agent ? `${agent.role} (${agent.specialty})` : message.speakerId;
            
            content += `### ${speakerName}\n\n`;
            content += `${message.content}\n\n`;
            content += `*${new Date(message.timestamp).toLocaleString()}*\n\n`;
        });
        
        return content;
    }
}

export { FileManager };
export default FileManager;