// This file contains the Markdown template for discussions.

const discussionTemplate = (topic, roundNumber, startTime, duration, participants) => {
    return `# ${topic} - 第${roundNumber}轮

## 基本信息
- **开始时间**: ${startTime}
- **持续时间**: ${duration}分钟
- **参与角色**: ${participants.join(', ')}

## 讨论内容

### 组织者: [总结/开场白]
[内容]

### 角色名称
[发言内容]

### 客户
[客户输入内容]

...

## 本轮总结
[总结内容]

## Agent 评估
- **角色名称**: [分数]/10
  - [评价内容]
- **角色名称**: [分数]/10
  - [评价内容]
...
`;
};

export default discussionTemplate;