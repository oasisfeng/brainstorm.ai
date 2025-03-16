package ai.brainstorm.api

import ai.brainstorm.api.model.ApiRequest
import ai.brainstorm.api.model.ApiResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class LlmClient(private val apiUrl: String, private val apiKey: String) {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
            })
        }
    }
    
    suspend fun sendRequest(request: ApiRequest): ApiResponse {
        return client.post(apiUrl) {
            contentType(ContentType.Application.Json)
            headers {
                append(HttpHeaders.Authorization, "Bearer $apiKey")
            }
            setBody(request)
        }.body()
    }
}