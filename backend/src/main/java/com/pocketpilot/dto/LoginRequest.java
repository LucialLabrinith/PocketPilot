package com.pocketpilot.dto;

public class LoginRequest {
    private String email;
    private String password;
    private String clientType = "WEB"; // "WEB" or "DESKTOP_JAVAFX"

    public LoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }
}
