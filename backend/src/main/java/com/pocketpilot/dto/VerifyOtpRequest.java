package com.pocketpilot.dto;

public class VerifyOtpRequest {
    private String email;
    private String otpCode;
    private String purpose; // REGISTRATION, PASSWORD_RESET, LOGIN
    private String clientType = "WEB";

    public VerifyOtpRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }
}
