import * as React from "react";
import { createRoot } from "react-dom/client";
// Import necessary Spark components and icons
import { SparkApp, PageContainer,
  Card, Button, Input, Textarea, Select, Checkbox, Markdown,
  Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogContent, DialogClose,
} from "@github/spark/components";
import { Robot, ChatCircle, Brain, Lightning, ListBullets, Plus, UserCircle, Send, PencilSimple, Trash, UserPlus, Gear, ArrowCounterClockwise, FloppyDisk, FolderOpen
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";

function App() {
  // Discussion
  const [topic, setTopic] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [agents, setAgents] = React.useState([]);
  const [summary, setSummary] = React.useState("");
  const [userMessage, setUserMessage] = React.useState("");
  const [deletedMessages, setDeletedMessages] = React.useState(new Map());
  // Agent management
  const [editingAgent, setEditingAgent] = React.useState(null);
  const [newAgentName, setNewAgentName] = React.useState("");
  const [newAgentExpertise, setNewAgentExpertise] = React.useState("");
  const [customInstructions, setCustomInstructions] = useKV("customInstructions", "");
  // Custom Agent LLM API
  const [agentApiUrl, setAgentApiUrl] = useKV("agentApiUrl", "");
  const [agentApiModel, setAgentApiModel] = useKV("agentApiModel", "");
  const [agentApiKey, setAgentApiKey] = useKV("agentApiKey", "");
  const [agentApiOptions, setAgentApiOptions] = useKV("agentApiOptions", "");
  const [useCustomApiForSummary, setUseCustomApiForSummary] = useKV("useCustomApiForSummary", false);
  const [batchAgentResponses, setBatchAgentResponses] = useKV("batchAgentResponses", true);
  const [availableModels, setAvailableModels] = React.useState([]);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);
  // Session management
  const [sessions, setSessions] = useKV("sessions", []);
  const [currentSessionName, setCurrentSessionName] = React.useState("");
  const [autoSave, setAutoSave] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showLoadDialog, setShowLoadDialog] = React.useState(false);
  // Reflection
  const [suggestedInstructions, setSuggestedInstructions] = React.useState("");
  const [showReflectionDialog, setShowReflectionDialog] = React.useState(false);

  const callInternalLLM = async (prompt) => {
    console.log("Calling LLM:\n", prompt);
    return spark.llm(prompt);
  };

  const callLLM = async (prompt) => {
    if (agentApiUrl === "" || agentApiModel === "") return callInternalLLM(prompt);

    console.log("Calling custom LLM:\n", prompt);
    try {
      let options = {};
      try { options = agentApiOptions ? JSON.parse(agentApiOptions) : {}; }
      catch (e) { console.warn("Invalid options JSON:", e); }
      
      const response = await fetch(`${agentApiUrl}/chat/completions`, {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
          ...(agentApiKey && { 'Authorization': `Bearer ${agentApiKey}` }),
        }, body: JSON.stringify({ model: agentApiModel, messages: [{ role: "user", content: prompt }], ...options })
      });
      const data = await response.json();
      const llmResponse = data.choices[0].message.content;
      // Clean up the response
      const cleanedResponse = llmResponse
        .replace(/<think>[\s\S]*?<\/think>\s*/g, '') // Remove thinking process and following whitespace
        .replace(/^\s*```(?:json)?\s*/m, '') // Remove leading code block marker and whitespace
        .replace(/\s*```\s*$/m, '') // Remove trailing code block marker and whitespace
        .trim();
      return cleanedResponse;
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

  // Function to generate a response for a single agent
  const generateAgentResponse = async (agent, summary, currentMessages) => {
    const agentPrompt = spark.llmPrompt`You are ${agent.name}, an expert in ${agent.expertise}, participating in a brainstorming session about "${topic}".
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    Please contribute your own unique ideas, insights, and perspectives on the discussion so far, in the same language as the discussion.
    Feel free to debate, challenge, or critically analyze the viewpoints presented by other participants.
    Your response should be brief, informal, and conversational, similar to how you would speak in a casual group discussion,
    but still add depth to the discussion through thought-provoking reflection and constructive debate.

    ${summary ? `Summary of earlier rounds: \`\`\`\n${summary}\n\`\`\`` : ''}
    Previous messages in the discussion: ${JSON.stringify(currentMessages)}
    Return only your message content as plain text.`;

    try {
      const response = await callLLM(agentPrompt);
      return { agent: agent.name, message: response, timestamp: Date.now() };
    } catch (error) {
      console.error(`Error generating response for ${agent.name}:`, error);
      return { agent: agent.name, message: `I'm having trouble formulating my thoughts right now.`, timestamp: Date.now() };
    }
  };

  // Function to generate responses for multiple agents in a single call
  const generateBatchAgentResponses = async (agents, summary, currentMessages) => {
    const prompt = spark.llmPrompt`You are simulating a brainstorming session on "${topic}". 
    The participants are: ${JSON.stringify(agents)}.
    ${summary ? `Summary of earlier rounds: \`\`\`\n${summary}\n\`\`\`` : ''}
    ${messages.length > 0 ? `Previous messages: ${JSON.stringify(messages)}` : "This is the start of the discussion."}

    Each expert must bring a contrarian and critical perspective based on their expertise.

    Generate one or more responses from each participant in arbitrary order suited for the ongoing debate.
    Please respond in the same language as the topic provided by user.
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    Return a JSON array of objects with 'agent' (expert name) and 'message' properties.`;

    try {
      const response = await callLLM(prompt);
      const responses = JSON.parse(response);
      return responses.map(r => ({ ...r, timestamp: Date.now() }));
    } catch (error) {
      console.error("Error generating batch responses:", error);
      return agents.map(agent => ({
        agent: agent.name,
        message: `I'm having trouble formulating my thoughts right now.`,
        timestamp: Date.now()
      }));
    }
  };

  // Function to start or continue discussion
  const startDiscussion = async (selectedAgents, rounds) => {
    if (rounds === 0) {
      setIsGenerating(false);
      return;
    }
    
    setIsGenerating(true);
    try {
      // Process one round at a time
      for (let i = 0; i < rounds; i++) {
        if (batchAgentResponses) {
          // Generate all agent responses in a single call
          const responses = await generateBatchAgentResponses(selectedAgents, summary, messages);
          setMessages(prev => [...prev, ...responses]);
        } else {
          // Generate responses from each agent independently
          for (const agent of selectedAgents) {
            const newMessage = await generateAgentResponse(agent, summary, messages);
            // Update messages immediately after each agent responds for a more dynamic feel
            setMessages(prev => [...prev, newMessage]);
          }
        }

        // Update the current round after all agents have responded
        setCurrentRound(rounds => rounds + 1);
      }
    } catch (error) {
      console.error("Error in discussion:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to add user message to discussion
  const addUserMessage = async () => {
    if (!userMessage.trim()) return;
    const newMessage = { agent: "User", message: userMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setUserMessage("");
  };

  // Function to generate discussion summary
  const generateSummary = async () => {
    const summaryPrompt = spark.llmPrompt`Summarize the following brainstorming discussion on "${topic}":
    ${JSON.stringify(messages)}
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    Please respond in the same language as the topic given by user.
    Provide a concise summary of the key points and insights discussed.`;

    setIsGenerating(true);
    try {
      const response = useCustomApiForSummary ? await callLLM(summaryPrompt) : await callInternalLLM(summaryPrompt);
      setSummary(response);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset discussion (clear messages, but keep agents and summary)
  const resetDiscussion = () => { setMessages([]); };

  // Expert management functions
  const removeAgent = (index) => { setAgents(prev => prev.filter((_, i) => i !== index)); };

  const addNewAgent = () => {
    if (newAgentName && newAgentExpertise) {
      setAgents(prev => [...prev, { name: newAgentName, expertise: newAgentExpertise }]);
      setNewAgentName("");
      setNewAgentExpertise("");
    }
  };

  const updateAgent = (index) => {
    if (editingAgent && editingAgent.name && editingAgent.expertise) {
      setAgents(prev => prev.map((agent, i) => i === index ? editingAgent : agent));
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

  // Fetch models when API URL changes
  React.useEffect(() => { if (agentApiUrl) { fetchAvailableModels(); } }, [agentApiUrl]);

  React.useEffect(() => {
    if (autoSave && currentSessionName && (messages.length > 0 || summary)) {
      saveSession(currentSessionName);
    }
  }, [autoSave, currentSessionName, agents, messages, summary]);

  const saveSession = (sessionName) => {
    const sessionData = {
      name: sessionName,
      timestamp: new Date().toISOString(),
      topic,
      agents,
      messages,
      summary
    };

    const updatedSessions = [...sessions];
    const existingIndex = sessions.findIndex(s => s.name === sessionName);
    
    if (existingIndex >= 0) {
      updatedSessions[existingIndex] = sessionData;
    } else {
      updatedSessions.push(sessionData);
    }

    setSessions(updatedSessions);
  };

  const loadSession = (sessionData) => {
    setTopic(sessionData.topic);
    setAgents(sessionData.agents);
    setMessages(sessionData.messages);
    setSummary(sessionData.summary);
    setCurrentSessionName(sessionData.name);
  };

  const deleteSession = (sessionName) => {
    const updatedSessions = sessions.filter(s => s.name !== sessionName);
    setSessions(updatedSessions);
    if (currentSessionName === sessionName) {
      setCurrentSessionName("");
    }
  };

  function handleReflect() {
    setIsGenerating(true);
    const reflectionPrompt = spark.llmPrompt`Reflect on the current session about "${topic}". 
    Agents: ${JSON.stringify(agents)}
    Messages: ${JSON.stringify(messages)}
    Current instructions: ${customInstructions}
    Provide an improved version of the instructions as plain text.`;
    
    callLLM(reflectionPrompt).then((response) => {
      setSuggestedInstructions(response.trim());
      setShowReflectionDialog(true);
      setIsGenerating(false);
    }).catch((error) => {
      console.error("Error reflecting on discussion:", error);
      setIsGenerating(false);
    });
  }

  const deleteMessage = (index) => {
    const message = messages[index];
    setDeletedMessages(prev => new Map(prev).set(index, message));
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const undoDelete = (index) => {
    const message = deletedMessages.get(index);
    if (message) {
      setMessages(prev => {
        const next = [...prev];
        next.splice(index, 0, message);
        return next;
      });
      setDeletedMessages(prev => {
        const next = new Map(prev);
        next.delete(index);
        return next;
      });
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
                <Button icon={<FloppyDisk />}>Save</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter session name"
                    value={currentSessionName}
                    onChange={(e) => setCurrentSessionName(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox checked={autoSave} onCheckedChange={setAutoSave}/>
                    <label className="text-sm text-fg-secondary">Auto-save future changes to this session</label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button variant="primary" onClick={() => {
                      saveSession(currentSessionName);
                      setShowSaveDialog(false);                  
                    }} disabled={!currentSessionName.trim()}
                  >Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Load Session Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button icon={<FolderOpen />}>Load</Button>
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
                              <p className="text-sm text-fg-secondary">{session.topic}</p>
                              <p className="text-xs text-fg-secondary">{new Date(session.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="primary" onClick={() => { loadSession(session); setShowLoadDialog(false); }}
                              >Load</Button>
                              <Button variant="plain" icon={<Trash />} onClick={() => deleteSession(session.name)} />
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

            {/* Settings button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button icon={<Gear />} variant="plain" aria-label="Settings" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                {/* Batch Agent Responses */}
                <div className="flex items-center gap-2">
                  <Checkbox checked={batchAgentResponses} onCheckedChange={setBatchAgentResponses} />
                  <label className="text-sm text-fg-secondary">Generate one round of agent responses in a batch</label>
                </div>
                {/* Custom Instructions */}
                <div className="space-y-4">
                  <h3 className="font-medium">Custom Instructions</h3>
                  <Textarea
                    placeholder="Enter custom instructions for agents..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={4}
                  />
                </div>
                {/* Custom LLM API */}
                <div className="space-y-4 mt-4">
                  <h3 className="font-medium">Custom LLM API</h3>
                  <Input placeholder="Enter custom API endpoint URL (before '/chat/completions')"
                    value={agentApiUrl} onChange={(e) => setAgentApiUrl(e.target.value)} />
                  <Input type="password" placeholder="API key"
                    value={agentApiKey} onChange={(e) => setAgentApiKey(e.target.value)} />
                  <div className="space-y-2">
                    <label className="text-sm text-fg-secondary">Model</label>
                    {agentApiUrl && (
                      <div className="flex gap-2">
                        <Select value={agentApiModel} onChange={(e) => setAgentApiModel(e.target.value)} className="flex-grow">
                          <option value="">Select a model</option>
                          {availableModels.map((model) => (<option key={model.id} value={model.id}>{model.id}</option>))}
                        </Select>
                        <Button icon={<ArrowCounterClockwise />} onClick={fetchAvailableModels} disabled={isLoadingModels}
                        >Refresh</Button>
                      </div>
                    )}
                    <Input placeholder="Model name (leave blank to use the internal LLM)"
                      value={agentApiModel} onChange={(e) => setAgentApiModel(e.target.value)} className="mt-2"/>
                    <div className="mt-4">
                      <label className="text-sm text-fg-secondary">Custom options (JSON format)</label>
                      <Input placeholder='{"temperature": 0.7, "top_p": 1, "reasoning_effort": "high"}'
                        value={agentApiOptions} onChange={(e) => setAgentApiOptions(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={useCustomApiForSummary} onCheckedChange={setUseCustomApiForSummary} />
                      <label className="text-sm text-fg-secondary">Use custom API for discussion summaries</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="primary">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Topic input and Suggest Experts button */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <Input icon={<Brain />} placeholder="Enter brainstorming topic" value={topic} onChange={(e) => setTopic(e.target.value)}/>
            <Button variant="primary" icon={<Lightning />} onClick={generateAgents} disabled={!topic || isGenerating}
            >Suggest Experts</Button>
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
                    <Input placeholder="Expert Name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} />
                    <Input placeholder="Area of Expertise" value={newAgentExpertise} onChange={(e) => setNewAgentExpertise(e.target.value)} />
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
                          <Button variant="plain" icon={<PencilSimple />} onClick={() => setEditingAgent({...agent})}/>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Expert</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Expert Name" value={editingAgent?.name || ""}
                              onChange={(e) => setEditingAgent(prev => ({ ...prev, name: e.target.value }))} />
                            <Input placeholder="Area of Expertise" value={editingAgent?.expertise || ""}
                              onChange={(e) => setEditingAgent(prev => ({ ...prev, expertise: e.target.value }))} />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button onClick={() => updateAgent(index)} variant="primary">Update Expert</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="plain" icon={<Trash />} onClick={() => removeAgent(index)}/>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {agents.length > 0 && !messages.length && (
              <Button variant="primary" className="mt-4" onClick={() => startDiscussion(agents, 1)} disabled={isGenerating}
              >Start Discussion</Button>
            )}
          </div>
        )}

        {/* Discussion section */}
        {(messages.length > 0 || summary !== "") && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Discussion</h2>
              <div className="flex gap-2">
                <Button icon={<ArrowCounterClockwise />} onClick={resetDiscussion} disabled={isGenerating}
                >Reset</Button>
                <Button icon={<ListBullets />} onClick={generateSummary} disabled={isGenerating}
                >Summarize</Button>
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
          {messages.map((msg, index) => {
            const isNewMessage = Date.now() - (msg.timestamp || 0) < 10000; // Messages less than 10 seconds old
            return (
              <Card key={index} className="p-4" style={isNewMessage ? { backgroundColor: '#d4edda' } : {}}>
                <div className="flex gap-2">
                  {msg.agent === "User" ? 
                    <UserCircle className="text-accent-secondary-9 mt-1" /> :
                    <ChatCircle className="text-accent-9 mt-1" />
                  }
                  <div className="flex-grow">
                    <div className="flex justify-between">
                    <h4 className="font-medium">{msg.agent}</h4>
                      <Button variant="plain" size="small" icon={<Trash />}
                        aria-label="Delete message" onClick={() => deleteMessage(index)} />
                    </div>
                    <Markdown>{msg.message}</Markdown>
                  </div>
                </div>
              </Card>
            );
          })}
          {/* Deleted message placeholders */}
          {Array.from(deletedMessages.entries()).map(([index, msg]) => (
            <Card key={`deleted-${index}`} className="p-2 bg-accent-1">
              <div className="flex mx-8 items-center justify-between text-sm text-fg-secondary">
                <span>Message deleted</span>
                <Button variant="plain" size="small" onClick={() => undoDelete(index)}
                >Undo</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* User input */}
        {agents.length > 0 && !isGenerating && (
          <div className="mt-8">
            <div className="flex gap-4">
              <Textarea placeholder="Join the discussion..." value={userMessage} onChange={(e) => setUserMessage(e.target.value)} className="flex-grow"/>
              <Button variant="primary" icon={<Send />} onClick={addUserMessage} disabled={!userMessage.trim()}
              >Send</Button>
            </div>
          </div>
        )}

        {/* Continue Discussion buttons */}
        {(messages.length > 0 || summary !== "") && !isGenerating && (
          <div className="mt-8">
            <h3 className="font-medium mb-4">Continue Discussion</h3>
            <div className="flex gap-4">
              {[1, 3, 5, 10].map(rounds => (
                <Button key={rounds} icon={<Plus />} onClick={() => {
                    setIsGenerating(true);
                    startDiscussion(agents, rounds);
                  }}
                >{rounds} {rounds === 1 ? 'Round' : 'Rounds'}</Button>
              ))}
              <div className="ml-auto">
                <Button onClick={handleReflect} variant="primary" icon={<Lightning />}>Reflect</Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isGenerating && (<div className="text-center mt-4"><p className="text-fg-secondary">Thinking...</p></div>)}

        {/* Reflection Dialog */}
        <Dialog open={showReflectionDialog} onOpenChange={setShowReflectionDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reflection</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Current instructions</h3>
              <Card className="p-4 bg-accent-1 overflow-auto">
                <Markdown>{customInstructions || "No custom instructions."}</Markdown>
              </Card>
              <h3 className="font-medium mb-2">Suggested instructions</h3>
              <Textarea value={suggestedInstructions} onChange={(e) => setSuggestedInstructions(e.target.value)} minRows={4} autoGrow />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Discard</Button></DialogClose>
              <Button variant="primary" onClick={() => {
                setCustomInstructions(suggestedInstructions);
                setShowReflectionDialog(false);
              }}>Accept</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
