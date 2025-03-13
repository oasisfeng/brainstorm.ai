// src/js/utils/markdownGenerator.js

function generateDiscussionMarkdown(discussion) {
    let markdown = `# ${discussion.topic} - 第${discussion.roundId}轮\n\n`;
    markdown += `## 基本信息\n`;
    markdown += `- **开始时间**: ${discussion.startTime}\n`;
    markdown += `- **持续时间**: ${discussion.roundDuration}分钟\n`;
    markdown += `- **参与角色**: ${discussion.agents.map(agent => agent.role).join(', ')}\n\n`;
    markdown += `## 讨论内容\n\n`;

    discussion.messages.forEach(message => {
        markdown += `### [${message.speakerId}]: ${message.content}\n`;
    });

    markdown += `\n## 本轮总结\n${discussion.summary}\n\n`;
    markdown += `## Agent 评估\n`;
    for (const [agentId, evaluation] of Object.entries(discussion.agentEvaluations)) {
        markdown += `- **[${evaluation.role}]**: ${evaluation.score}/10\n  - ${evaluation.feedback}\n`;
    }

    return markdown;
}

function generateSummaryMarkdown(summary) {
    let markdown = `# 讨论总结\n\n`;
    markdown += `## 主题: ${summary.topic}\n`;
    markdown += `## 总结内容\n${summary.content}\n`;
    markdown += `## 参与角色评估\n`;
    summary.agentEvaluations.forEach(evaluation => {
        markdown += `- **[${evaluation.role}]**: ${evaluation.score}/10\n  - ${evaluation.feedback}\n`;
    });

    return markdown;
}

export { generateDiscussionMarkdown, generateSummaryMarkdown };