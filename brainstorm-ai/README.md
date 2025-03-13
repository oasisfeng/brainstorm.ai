# README for Brainstorm AI

## Project Overview

Brainstorm AI is a web-based application designed to facilitate collaborative brainstorming sessions using multiple AI agents. The application allows users to initiate discussions on various topics, manage AI agents, and generate summaries of the discussions.

## Features

- **Multi-Agent Collaboration**: Engage multiple AI agents, each with specific roles and expertise, to generate diverse insights on a given topic.
- **User Control**: Users can control the discussion flow, pause sessions, and provide input at any time.
- **Discussion Summaries**: Automatically generate summaries of each discussion round for easy reference.
- **Markdown Output**: Save discussions and summaries in a user-friendly Markdown format.
- **Local File Management**: Load and save discussions from the local file system, allowing for seamless user interaction across different devices.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, etc.)
- Basic knowledge of JavaScript and web development

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/brainstorm-ai.git
   ```
2. Navigate to the project directory:
   ```
   cd brainstorm-ai
   ```
3. Open `index.html` in your web browser to start the application.

### Usage

- Upon launching the application, users can input a discussion topic and set the initial parameters for the brainstorming session.
- Users can interact with the AI agents, providing input and managing the discussion flow.
- At the end of each round, a summary will be generated and saved in Markdown format.

## Project Structure

```
brainstorm-ai
├── src
│   ├── js
│   ├── css
│   └── index.html
├── public
│   └── favicon.ico
├── templates
│   └── prompts
├── config
│   └── defaultConfig.json
├── docs
│   ├── design.md
│   ├── implementation.md
│   └── userGuide.md
├── tests
│   ├── unit
│   └── integration
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.