// This file contains the Markdown template for summaries.

const summaryTemplate = (discussion) => {
    return `
# ${discussion.topic} - 第${discussion.roundId}轮

## 基本信息
- **开始时间**: ${discussion.startTime}
- **持续时间**: ${discussion.duration}分钟
- **参与角色**: ${discussion.agents.map(agent => agent.role).join(', ')}

## 讨论内容

${discussion.messages.map(message => `
### [${message.speakerId}]: 
${message.content}
`).join('')}

## 本轮总结
${discussion.summary}

## Agent 评估
${discussion.agentEvaluations.map(evaluation => `
- **[${evaluation.agentId}]**: ${evaluation.score}/10
  - ${evaluation.feedback}
`).join('')}
`;
};

export default summaryTemplate;