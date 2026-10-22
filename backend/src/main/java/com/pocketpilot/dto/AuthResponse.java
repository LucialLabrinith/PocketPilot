package com.pocketpilot.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String fullName;
    private String currency;
    private boolean verified;
    private String message;
    private String devOtp; // Provided only in development mode for easy testing

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String email, String fullName, String currency, boolean verified, String message) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.currency = currency;
        this.verified = verified;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getDevOtp() { return devOtp; }
    public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
}
