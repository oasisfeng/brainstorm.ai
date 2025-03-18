package ai.brainstorm.prompts

/**
 * Manages workflow-related guidance texts shown to users
 */
class WorkflowTextManager {
    private val texts = mutableMapOf<String, String>()
    
    init {
        loadDefaultTexts()
    }
    
    /**
     * Gets a workflow text by its key
     */
    fun getText(key: String): String {
        return texts[key] ?: "No text found for key: $key"
    }
    
    /**
     * Gets a workflow text with replaced placeholders
     */
    fun getWorkflowText(key: String, replacements: Map<String, String>): String {
        var text = getText(key)
        replacements.forEach { (placeholder, value) ->
            text = text.replace("{$placeholder}", value)
        }
        return text
    }
    
    /**
     * Adds or updates a workflow text
     */
    fun setText(key: String, text: String) {
        texts[key] = text
    }
    
    /**
     * Loads default workflow texts
     */
    private fun loadDefaultTexts() {
        // Opening text shown to users
        texts["opening"] = """
            👋 大家好，我是这次头脑风暴的组织者。

            我将协助大家进行一场富有成效的头脑风暴讨论。首先，我需要了解您希望讨论的主题以及任何特殊要求（如每轮发言次数、希望指定邀请的专家）。

            请告诉我您想探讨的主题和相关要求，我会据此安排合适的专家参与讨论。
        """.trimIndent()
        
        // Planning phase text
        texts["planning"] = """
            基于用户提供的主题"{topic}"，我现在将规划本轮讨论：

            1. 考虑主题特点，确定需要哪些领域的专家
            2. 为每位专家设计明确的角色和关注点
            3. 安排专家发言顺序，确保讨论的逻辑性和全面性

            规划完成后，我将立即执行，邀请各位专家按顺序发言，最后进行总结评估。
        """.trimIndent()
        
        // Summary text template
        texts["summary"] = """
            感谢各位专家的精彩发言。现在我将对本轮讨论进行总结和评估：

            【讨论总结】
            • 主要观点：
              - [列出各专家提出的主要观点]
            • 创新想法：
              - [强调特别有创意或突破性的想法]
            • 共识与分歧：
              - [指出专家们达成的共识和存在的分歧]
              
            【专家表现评估】(10分制)
            • [专家1]：[评分] - [简短评价]
            • [专家2]：[评分] - [简短评价]
            • [专家3]：[评分] - [简短评价]
            
            【下一步方向】
            基于本轮讨论，以下方向值得进一步探索：
            1. [方向1]
            2. [方向2]
            3. [方向3]

            我们即将进入下一轮讨论。
        """.trimIndent()
        
        // New round text template
        texts["new_round"] = """
            欢迎来到新一轮的头脑风暴讨论。

            基于上一轮的讨论成果，我们已经[简述上一轮的主要成果]。

            在这一轮中，我建议我们聚焦于[建议的焦点]。

            在继续之前，您是否有任何补充信息、调整需求，或者希望结束整个头脑风暴？
            您也可以要求调整专家阵容或讨论方向。
        """.trimIndent()
    }
}