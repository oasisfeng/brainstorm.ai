# Brainstorm AI

## Overview

Brainstorm AI is a Kotlin Multiplatform project designed to facilitate collaborative brainstorming sessions using AI agents. The system allows users to initiate discussions, manage multiple agents, and summarize outcomes effectively. It supports both shell and web interaction methods, making it versatile for different user preferences.

## Features

- **AI Agents**: The system utilizes AI agents that can be assigned specific roles and focuses to contribute to discussions.
- **Discussion Management**: Organizers can manage discussion rounds, summarize outcomes, and adjust agent participation based on performance.
- **User Interaction**: Users can interact with the system through a shell interface or a web application, providing flexibility in how they engage with the brainstorming process.
- **API Integration**: The system integrates with a Language Model (LLM) API to facilitate intelligent responses and interactions.

## Project Structure

The project is organized into the following main components:

- **Core**: Contains the main classes for managing agents, sessions, and discussions.
  - `Agent.kt`: Defines the AI agent class.
  - `BrainstormSession.kt`: Manages the overall brainstorming session.
  - `Organizer.kt`: Coordinates the brainstorming process.
  - `DiscussionRound.kt`: Represents a single round of discussion.

- **API**: Handles communication with the LLM API.
  - `LlmClient.kt`: Client interface for API interactions.
  - `model`: Contains data classes for API requests and responses.
  - `tools`: Implements logic for tool calls, including assigning and invoking agents.

- **Configuration**: Contains application configuration settings and prompt templates.

- **Shell**: Implements the shell interface for user interactions.

- **Web**: Implements the web interface for user interactions.

## Getting Started

### Prerequisites

- Kotlin 1.5 or higher
- Gradle 7.0 or higher

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd brainstorm-ai
   ```

2. Build the project using Gradle:
   ```
   ./gradlew build
   ```

3. Run the shell application:
   ```
   ./gradlew run -PmainClass=ai.brainstorm.shell.ShellApp
   ```

4. For the web application, open `src/jsMain/resources/index.html` in a web browser.

## Usage

- **Shell Interface**: Users can input discussion topics and interact with agents through the command line.
- **Web Interface**: Users can access the brainstorming session via a web browser, providing a more visual interaction experience.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.