// This file defines the Message class, representing messages exchanged during discussions.

package ai.brainstorm.model

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

data class Message(
    val sender: String,
    val content: String,
    val timestamp: Instant = Clock.System.now()
)