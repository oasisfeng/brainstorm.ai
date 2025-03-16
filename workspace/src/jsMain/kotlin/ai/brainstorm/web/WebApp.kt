package ai.brainstorm.web

import ai.brainstorm.core.BrainstormSession
import ai.brainstorm.core.Agent
import kotlinx.browser.document
import react.*
import react.dom.html.ReactHTML.button
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.h2
import react.dom.html.ReactHTML.input
import react.dom.html.ReactHTML.p
import web.html.HTMLInputElement
import web.html.InputType

val WebApp = FC<Props> {
    val (session, setSession) = useState<BrainstormSession?>(null)
    val (userInput, setUserInput) = useState("")
    val (discussionOutput, setDiscussionOutput) = useState<List<String>>(emptyList())
    
    useEffectOnce {
        // Initialize the brainstorming session
        val newSession = BrainstormSession()
        
        // Create some default agents
        val agents = listOf(
            Agent("1", "思想家", "创造性思维", "gpt-4"),
            Agent("2", "批评者", "逻辑分析", "gpt-4"),
            Agent("3", "实用主义者", "实际应用", "gpt-4")
        )
        
        newSession.initializeAgents(agents)
        setSession(newSession)
    }
    
    div {
        h1 {
            +"头脑风暴系统"
        }
        p {
            +"欢迎来到头脑风暴会话！请输入您想讨论的主题。"
        }
        
        input {
            type = InputType.text
            placeholder = "输入讨论主题..."
            value = userInput
            onChange = { event ->
                setUserInput((event.target as HTMLInputElement).value)
            }
        }
        
        button {
            +"开始讨论"
            onClick = {
                session?.let { activeSession ->
                    activeSession.startNewRound(context = userInput)
                    activeSession.collectInputs()
                    activeSession.summarizeRound()
                    setDiscussionOutput(activeSession.getSessionHistory())
                    setUserInput("") // 清空输入框
                }
            }
        }
        
        // 显示讨论输出
        if (discussionOutput.isNotEmpty()) {
            div {
                h2 {
                    +"当前讨论"
                }
                discussionOutput.forEach { message ->
                    p {
                        +message
                    }
                }
            }
        }
    }
}