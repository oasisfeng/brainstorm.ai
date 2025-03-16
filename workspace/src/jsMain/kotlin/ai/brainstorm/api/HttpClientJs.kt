package ai.brainstorm.api

import ai.brainstorm.api.model.ApiRequest
import ai.brainstorm.api.model.ApiResponse
import ai.brainstorm.api.model.ChatMessage
import kotlinx.browser.window
import kotlinx.coroutines.await
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.w3c.fetch.RequestInit
import org.w3c.fetch.Headers

class HttpClientJs {
    private val apiUrl = "http://192.168.1.7:1234/v1/chat/completions"
    private val json = Json { ignoreUnknownKeys = true }
    
    suspend fun sendRequest(request: ApiRequest): ApiResponse {
        val requestBody = json.encodeToString(request)
        val headers = Headers()
        headers.append("Content-Type", "application/json")
        
        val init = object : RequestInit {
            override var method: String? = "POST"
            override var headers: dynamic = headers
            override var body: dynamic = requestBody
        }
        
        val response = window.fetch(apiUrl, init).await()
        
        if (!response.ok) {
            throw Exception("HTTP error! status: ${response.status}")
        }
        
        val responseText = response.text().await()
        return json.decodeFromString<ApiResponse>(responseText)
    }
}