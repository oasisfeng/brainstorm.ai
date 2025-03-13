// This file contains various helper functions used throughout the application.

function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function formatTimestamp(date) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function validateInput(input, type) {
    if (type === 'string') {
        return typeof input === 'string' && input.trim() !== '';
    }
    if (type === 'number') {
        return typeof input === 'number' && !isNaN(input);
    }
    return false;
}

export {
    generateUniqueId,
    formatTimestamp,
    deepClone,
    isEmptyObject,
    validateInput
};