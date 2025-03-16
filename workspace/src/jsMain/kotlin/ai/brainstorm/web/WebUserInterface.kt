package ai.brainstorm.web

import ai.brainstorm.core.BrainstormSession
import kotlinx.browser.document
import react.*
import react.dom.client.createRoot
import react.dom.html.ReactHTML.button
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.input
import react.dom.html.ReactHTML.p
import web.html.HTMLInputElement
import web.html.InputType
import web.dom.Element
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class WebUserInterface {
    private val scope = MainScope()
    
    fun start() {
        val container = document.getElementById("app") ?: error("Could not find container element")
        createRoot(container as Element).render(createElement(WebApp))
    }
    
    companion object {
        @JsName("runApp")
        fun runApp() {
            WebUserInterface().start()
        }
    }
}