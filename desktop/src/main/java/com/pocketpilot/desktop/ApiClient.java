package com.pocketpilot.desktop;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * PocketPilot JavaFX API Client
 * Connects the desktop application to the shared Spring Boot REST API
 */
public class ApiClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private String authToken = null;

    public ApiClient(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void setAuthToken(String token) {
        this.authToken = token;
    }

    public String getAuthToken() {
        return authToken;
    }

    public HttpResponse<String> post(String endpoint, String jsonBody) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody));

        if (authToken != null && !authToken.isEmpty()) {
            builder.header("Authorization", "Bearer " + authToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    public HttpResponse<String> get(String endpoint) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + endpoint))
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(15))
                .GET();

        if (authToken != null && !authToken.isEmpty()) {
            builder.header("Authorization", "Bearer " + authToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    public HttpResponse<String> register(String email, String password, String fullName, String currency) throws IOException, InterruptedException {
        String json = String.format("{\"email\":\"%s\",\"password\":\"%s\",\"fullName\":\"%s\",\"currency\":\"%s\"}",
                escape(email), escape(password), escape(fullName), escape(currency));
        return post("/auth/register", json);
    }

    public HttpResponse<String> verifyOtp(String email, String otpCode, String purpose) throws IOException, InterruptedException {
        String json = String.format("{\"email\":\"%s\",\"otpCode\":\"%s\",\"purpose\":\"%s\",\"clientType\":\"DESKTOP_JAVAFX\"}",
                escape(email), escape(otpCode), escape(purpose));
        return post("/auth/verify-otp", json);
    }

    public HttpResponse<String> login(String email, String password) throws IOException, InterruptedException {
        String json = String.format("{\"email\":\"%s\",\"password\":\"%s\",\"clientType\":\"DESKTOP_JAVAFX\"}",
                escape(email), escape(password));
        return post("/auth/login", json);
    }

    public HttpResponse<String> logout() throws IOException, InterruptedException {
        return post("/auth/logout", "{}");
    }

    public HttpResponse<String> getAccounts() throws IOException, InterruptedException {
        return get("/accounts");
    }

    public HttpResponse<String> getTransactions() throws IOException, InterruptedException {
        return get("/transactions");
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
