class Message {
    constructor(id, speakerId, timestamp, content, type) {
        this.id = id; // Unique identifier for the message
        this.speakerId = speakerId; // ID of the speaker (agent or client)
        this.timestamp = timestamp; // Date and time when the message was sent
        this.content = content; // Content of the message
        this.type = type; // Type of the message (NORMAL, QUESTION, SUMMARY, EVALUATION)
    }
}

export default Message;