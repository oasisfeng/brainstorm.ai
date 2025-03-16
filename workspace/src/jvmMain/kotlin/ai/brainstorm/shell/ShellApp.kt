package ai.brainstorm.shell

import ai.brainstorm.core.BrainstormSession
import ai.brainstorm.shell.ShellUserInterface

fun main() {
    val session = BrainstormSession()
    val userInterface = ShellUserInterface(session)
    userInterface.start()
}