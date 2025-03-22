import * as React from "react";
import { createRoot } from "react-dom/client";
// Import necessary Spark components and icons
import { 
  SparkApp, 
  PageContainer,
  Button,
  Input,
  Card,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Select,
  Markdown
} from "@github/spark/components";
import { useKV } from "@github/spark/hooks";
import { 
  Robot,
  ChatCircle, 
  Brain,
  Lightning,
  ListBullets,
  Plus,
  UserCircle,
  Send,
  PencilSimple,
  Trash,
  UserPlus,
  Gear,
  ArrowCounterClockwise,
  FloppyDisk,
  FolderOpen
} from "@phosphor-icons/react";

function App() {
  // State variables
  const [topic, setTopic] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [agents, setAgents] = React.useState([]);
  const [summary, setSummary] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");
  const [editingAgent, setEditingAgent] = React.useState(null);
  const [newAgentName, setNewAgentName] = React.useState("");
  const [newAgentExpertise, setNewAgentExpertise] = React.useState("");
  // Custom instructions state persisted using useKV hook
  const [customInstructions, setCustomInstructions] = useKV("customInstructions", "");
  // Agent LLM API state persisted using useKV hook
  const [agentApiUrl, setAgentApiUrl] = useKV("agentApiUrl", "");
  const [agentApiModel, setAgentApiModel] = useKV("agentApiModel", "");
  const [availableModels, setAvailableModels] = React.useState([]);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);
  // Session management
  const [sessions, setSessions] = useKV("sessions", []);
  const [currentSessionName, setCurrentSessionName] = React.useState("");
  const [newSessionName, setNewSessionName] = React.useState("");
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showLoadDialog, setShowLoadDialog] = React.useState(false);

  // Function to call custom LLM API
  const callLLM = async (prompt) => {
    if (agentApiUrl === "" || agentApiModel === "") return spark.llm(prompt);
    try {
      const response = await fetch(`${agentApiUrl}//chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary headers here
        },
        body: JSON.stringify({
          model: agentApiModel,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling custom LLM:", error);
      throw error;
    }
  };

  // Function to generate initial agents based on topic
  const generateAgents = async () => {
    setIsGenerating(true);
    const prompt = spark.llmPrompt`Given the topic "${topic}", suggest 3-4 expert personas that would be valuable for a brainstorming session. Please respond in the same language as the topic given by user. Return only a JSON array of objects with 'name' and 'expertise' properties. ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}`;
    
    try {
      const response = await callLLM(prompt);
      const agentList = JSON.parse(response);
      setAgents(agentList);
    } catch (error) {
      console.error("Error generating agents:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to start or continue discussion
  const startDiscussion = async (selectedAgents, rounds) => {
    if (rounds === 0) {
      setIsGenerating(false);
      return;
    }

    const discussionPrompt = spark.llmPrompt`You are hosting a brainstorming session on "${topic}". 
    The participants are: ${JSON.stringify(selectedAgents)}.
    ${summary ? `Summary of earlier rounds: ${summary}` : ''}
    ${messages.length > 0 ? `Previous messages: ${JSON.stringify(messages)}` : "This is the start of the discussion."}
    ${customInstructions ? `Additional instructions for agents: ${customInstructions}` : ''}
    Generate one response from each agent, making sure they build on previous ideas and interact with each other.
    Please respond in the same language as the topic given by user.
    Return a JSON array of messages, each with 'agent' and 'message' properties.`;

    try {
      const response = await callLLM(discussionPrompt);
      const newMessages = JSON.parse(response);
      
      setMessages(prev => [...prev, ...newMessages]);
      setCurrentRound(prev => prev + 1);
      
      if (rounds > 1) {
        startDiscussion(selectedAgents, rounds - 1);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error in discussion:", error);
      setIsGenerating(false);
    }
  };

  // Function to add user message to discussion
  const addUserMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = {
      agent: "User",
      message: userMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setUserMessage("");

    setIsGenerating(true);
    const responsePrompt = spark.llmPrompt`In this brainstorming session about "${topic}",
    the user just said: "${userMessage}".
    Previous messages: ${JSON.stringify(messages)}
    ${customInstructions ? `Additional instructions for agents: ${customInstructions}` : ''}
    Generate one response from each AI agent, making them react to the user's input.
    Please respond in the same language as the topic given by user.
    Return a JSON array of messages, each with 'agent' and 'message' properties.`;

    try {
      const response = await callLLM(responsePrompt);
      const newMessages = JSON.parse(response);
      setMessages(prev => [...prev, ...newMessages]);
    } catch (error) {
      console.error("Error generating responses:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate discussion summary
  const generateSummary = async () => {
    setIsGenerating(true);
    const summaryPrompt = spark.llmPrompt`Summarize the following brainstorming discussion on "${topic}":
    ${JSON.stringify(messages)}
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    Please respond in the same language as the topic given by user.
    Provide a concise summary of the key points and insights discussed.`;

    try {
      const response = await callLLM(summaryPrompt);
      setSummary(response);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to reset discussion (clear messages)
  const resetDiscussion = () => {
    setMessages([]);
  };

  // Expert management functions
  const removeAgent = (index) => {
    setAgents(prev => prev.filter((_, i) => i !== index));
  };

  const addNewAgent = () => {
    if (newAgentName && newAgentExpertise) {
      setAgents(prev => [...prev, {
        name: newAgentName,
        expertise: newAgentExpertise
      }]);
      setNewAgentName("");
      setNewAgentExpertise("");
    }
  };

  const updateAgent = (index) => {
    if (editingAgent && editingAgent.name && editingAgent.expertise) {
      setAgents(prev => prev.map((agent, i) => 
        i === index ? editingAgent : agent
      ));
      setEditingAgent(null);
    }
  };

  // Function to fetch available models from custom API
  const fetchAvailableModels = async () => {
    if (!agentApiUrl) return;
    setIsLoadingModels(true);
    try {
      const response = await fetch(`${agentApiUrl}/models`);
      const data = await response.json();
      setAvailableModels(data.data || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Effect to fetch models when API URL changes
  React.useEffect(() => {
    if (agentApiUrl) {
      fetchAvailableModels();
    }
  }, [agentApiUrl]);

  const saveSession = () => {
    if (!newSessionName.trim()) return;
    
    const sessionData = {
      name: newSessionName,
      timestamp: new Date().toISOString(),
      topic,
      agents,
      messages,
      summary
    };

    const updatedSessions = [...sessions];
    const existingIndex = sessions.findIndex(s => s.name === newSessionName);
    
    if (existingIndex >= 0) {
      updatedSessions[existingIndex] = sessionData;
    } else {
      updatedSessions.push(sessionData);
    }

    setSessions(updatedSessions);
    setCurrentSessionName(newSessionName);
    setNewSessionName("");
    setShowSaveDialog(false);
  };

  const loadSession = (sessionData) => {
    setTopic(sessionData.topic);
    setAgents(sessionData.agents);
    setMessages(sessionData.messages);
    setSummary(sessionData.summary);
    setCurrentSessionName(sessionData.name);
    setShowLoadDialog(false);
  };

  const deleteSession = (sessionName) => {
    const updatedSessions = sessions.filter(s => s.name !== sessionName);
    setSessions(updatedSessions);
    if (currentSessionName === sessionName) {
      setCurrentSessionName("");
    }
  };

  return (
    <SparkApp>
      <PageContainer maxWidth="large">
        {/* Header with title, session name, and buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Brainstorm.AI</h1>
          </div>
          <div className="flex gap-2">
            {/* Save Session Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button icon={<FloppyDisk />}>Save Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter session name"
                    value={newSessionName || currentSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button 
                    variant="primary" 
                    onClick={() => saveSession(newSessionName || currentSessionName)}
                    disabled={!newSessionName.trim() && !currentSessionName}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Load Session Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button icon={<FolderOpen />}>Load Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-fg-secondary">No saved sessions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <Card key={session.name} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{session.name}</h3>
                              <p className="text-sm text-fg-secondary">
                                Topic: {session.topic}
                              </p>
                              <p className="text-xs text-fg-secondary">
                                {new Date(session.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                onClick={() => loadSession(session)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="plain"
                                icon={<Trash />}
                                onClick={() => deleteSession(session.name)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Settings button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button icon={<Gear />} variant="plain" aria-label="Settings" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              {/* Custom Instructions Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Custom Instructions</h3>
                <Textarea
                  placeholder="Enter custom instructions for agents..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                />
              </div>
              {/* Agent LLM API Section */}
              <div className="space-y-4 mt-4">
                <h3 className="font-medium">Agent LLM API</h3>
                <Input
                  placeholder="Enter custom API endpoint URL"
                  value={agentApiUrl}
                  onChange={(e) => setAgentApiUrl(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm text-fg-secondary">Model Selection</label>
                  {agentApiUrl && (
                    <div className="flex gap-2">
                      <Select 
                        value={agentApiModel}
                        onChange={(e) => setAgentApiModel(e.target.value)}
                        className="flex-grow"
                      >
                        <option value="">Select a model</option>
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.id}
                          </option>
                        ))}
                      </Select>
                      <Button
                        icon={<Lightning />}
                        onClick={fetchAvailableModels}
                        disabled={isLoadingModels}
                      >
                        Refresh
                      </Button>
                    </div>
                  )}
                  <Input
                    placeholder="Or enter model name manually"
                    value={agentApiModel}
                    onChange={(e) => setAgentApiModel(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <p className="text-sm text-fg-secondary">
                  Leave blank to use the default AI model.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="primary">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Topic input and Suggest Experts button */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <Input
              icon={<Brain />}
              placeholder="Enter brainstorming topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button
              variant="primary"
              icon={<Lightning />}
              onClick={generateAgents}
              disabled={!topic || isGenerating}
            >
              Suggest Experts
            </Button>
          </div>
        </div>

        {/* Agents management section */}
        {agents.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Expert Panel</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button icon={<UserPlus />}>Add Expert</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Expert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Expert Name"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                    />
                    <Input
                      placeholder="Area of Expertise"
                      value={newAgentExpertise}
                      onChange={(e) => setNewAgentExpertise(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={addNewAgent} variant="primary">Add Expert</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Robot className="text-accent-9" />
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-sm text-fg-secondary">{agent.expertise}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="plain" 
                            icon={<PencilSimple />} 
                            onClick={() => setEditingAgent({...agent})}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Expert</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Expert Name"
                              value={editingAgent?.name || ""}
                              onChange={(e) => setEditingAgent(prev => ({
                                ...prev,
                                name: e.target.value
                              }))}
                            />
                            <Input
                              placeholder="Area of Expertise"
                              value={editingAgent?.expertise || ""}
                              onChange={(e) => setEditingAgent(prev => ({
                                ...prev,
                                expertise: e.target.value
                              }))}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button onClick={() => updateAgent(index)} variant="primary">
                                Update Expert
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="plain" 
                        icon={<Trash />} 
                        onClick={() => removeAgent(index)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {agents.length > 0 && !messages.length && (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => startDiscussion(agents, 1)}
                disabled={isGenerating}
              >
                Start Discussion
              </Button>
            )}
          </div>
        )}

        {/* Discussion section */}
        {(messages.length > 0 || summary != "") && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Discussion</h2>
              <div className="flex gap-2">
                <Button
                  icon={<ArrowCounterClockwise />}
                  onClick={resetDiscussion}
                  disabled={isGenerating}
                >
                  Reset
                </Button>
                <Button
                  icon={<ListBullets />}
                  onClick={generateSummary}
                  disabled={isGenerating}
                >
                  Summarize
                </Button>
              </div>
            </div>
            {summary && (
              <Card className="mb-4 p-4 bg-accent-1">
                <h3 className="font-medium mb-2">Summary</h3>
                <Markdown>{summary}</Markdown>
              </Card>
            )}
          </div>
        )}

        {/* Messages display */}
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <Card key={index} className="p-4">
              <div className="flex gap-2">
                {msg.agent === "User" ? 
                  <UserCircle className="text-accent-secondary-9 mt-1" /> :
                  <ChatCircle className="text-accent-9 mt-1" />
                }
                <div className="flex-grow">
                  <h4 className="font-medium">{msg.agent}</h4>
                  <Markdown>{msg.message}</Markdown>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* User input */}
        {agents.length > 0 && !isGenerating && (
          <div className="mt-8">
            <div className="flex gap-4">
              <Textarea
                placeholder="Join the discussion..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="flex-grow"
              />
              <Button
                variant="primary"
                icon={<Send />}
                onClick={addUserMessage}
                disabled={!userMessage.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Continue Discussion buttons */}
        {(messages.length > 0 || summary != "") && !isGenerating && (
          <div className="mt-8">
            <h3 className="font-medium mb-4">Continue Discussion</h3>
            <div className="flex gap-4">
              {[1, 3, 5, 10].map(rounds => (
                <Button
                  key={rounds}
                  icon={<Plus />}
                  onClick={() => {
                    setIsGenerating(true);
                    startDiscussion(agents, rounds);
                  }}
                >
                  {rounds} {rounds === 1 ? 'Round' : 'Rounds'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isGenerating && (
          <div className="text-center mt-4">
            <p className="text-fg-secondary">
              {currentRound > 0 ? `Generating round ${currentRound + 1}...` : 'Starting discussion...'}
            </p>
          </div>
        )}
      </PageContainer>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
