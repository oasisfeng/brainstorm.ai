// src/js/utils/fileUtils.js

// Utility function to read a file
async function readFile(filePath) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(filePath);
    });
}

// Utility function to write to a file
async function writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filePath;
        link.click();
        resolve();
    });
}

// Utility function to clear a file's content
async function clearFile(filePath) {
    return writeFile(filePath, '');
}

// Utility function to check if a file exists
async function fileExists(filePath) {
    // This function is a placeholder as checking file existence is not straightforward in a browser environment.
    // You may need to implement a different approach based on your application's requirements.
    return false;
}

// Exporting the utility functions
export { readFile, writeFile, clearFile, fileExists };