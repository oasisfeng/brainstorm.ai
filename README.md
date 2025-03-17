# README.md

# Brainstorm AI

Brainstorm AI is a collaborative brainstorming tool powered by AI agents. It facilitates multi-round discussions where users can interact with various AI agents to generate ideas and solutions based on a given topic.

## Features

- **Multi-Agent Collaboration**: Engage with multiple AI agents, each with specialized roles and expertise.
- **User Participation**: Users can provide input, adjust discussion topics, and interact with agents in real-time.
- **Structured Discussions**: The system organizes discussions into rounds, ensuring a coherent flow of ideas.

## Project Structure

```
brainstorm.ai
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── src
│   ├── commonMain
│   │   ├── kotlin
│   │   │   └── ai
│   │   │       └── brainstorm
│   │   │           ├── App.kt
│   │   │           ├── controller
│   │   │           │   └── MainController.kt
│   │   │           ├── agent
│   │   │           │   └── AgentManager.kt
│   │   │           ├── model
│   │   │           │   ├── Agent.kt
│   │   │           │   └── Message.kt
│   │   │           ├── config
│   │   │           │   └── ConfigManager.kt
│   │   │           └── tools
│   │   │               └── LlmTools.kt
│   │   └── resources
│   │       └── prompts.md
│   └── jvmMain
│       └── kotlin
│           └── ai
│               └── brainstorm
│                   └── Main.kt
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
├── gradlew.bat
└── README.md
```

## Getting Started

### Prerequisites

- Kotlin 1.5 or higher
- Gradle 7.0 or higher

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd brainstorm.ai
   ```

2. Build the project using Gradle:
   ```
   ./gradlew build
   ```

### Running the Application

To start the application, run the following command:
```
./gradlew run
```

## Usage

Upon starting the application, users will be prompted to enter a discussion topic. The system will then initiate a brainstorming session with the AI agents, allowing for interactive discussions.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.