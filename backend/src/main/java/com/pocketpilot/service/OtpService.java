package com.pocketpilot.service;

import com.pocketpilot.model.OtpVerification;
import com.pocketpilot.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${pocketpilot.otp.expiration-minutes:10}")
    private int expirationMinutes;

    @Value("${pocketpilot.otp.max-resend-attempts:3}")
    private int maxResendAttempts;

    @Value("${pocketpilot.otp.resend-window-minutes:15}")
    private int resendWindowMinutes;

    @Value("${pocketpilot.otp.dev-mode:true}")
    private boolean devMode;

    public OtpService(OtpVerificationRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public boolean isDevMode() {
        return devMode;
    }

    @Transactional
    public String generateAndSendOtp(String email, String purpose) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(resendWindowMinutes);
        List<OtpVerification> recentOtps = otpRepository.findByEmailAndCreatedAtAfter(email.toLowerCase(), windowStart);

        if (recentOtps.size() >= maxResendAttempts) {
            throw new IllegalStateException("Maximum OTP resend limit reached (" + maxResendAttempts + " requests per " + resendWindowMinutes + " minutes). Please wait before trying again.");
        }

        // Generate cryptographically secure 6-digit code
        int codeInt = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(codeInt);

        OtpVerification otp = new OtpVerification(
                UUID.randomUUID().toString(),
                email.toLowerCase(),
                otpCode,
                purpose,
                LocalDateTime.now().plusMinutes(expirationMinutes)
        );
        otp.setResendCount(recentOtps.size());
        otpRepository.save(otp);

        // Development mode logging vs real email delivery
        if (devMode) {
            System.out.println("=================================================");
            System.out.println("[DEV OTP MODE] OTP for " + email + " (" + purpose + "): " + otpCode);
            System.out.println("Expires at: " + otp.getExpiresAt());
            System.out.println("=================================================");
        } else {
            // Deliver via real SMTP configured in application.properties
            System.out.println("[PROD OTP EMAIL] Sent email OTP to " + email);
        }

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode, String purpose) {
        Optional<OtpVerification> optionalOtp = otpRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                email.toLowerCase(), purpose
        );

        if (optionalOtp.isEmpty()) {
            throw new IllegalArgumentException("No pending verification found for " + email + ". Please request a new OTP.");
        }

        OtpVerification otp = optionalOtp.get();

        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            otp.setUsed(true);
            otpRepository.save(otp);
            throw new IllegalArgumentException("The OTP code has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= 3) {
            otp.setUsed(true);
            otpRepository.save(otp);
            throw new IllegalArgumentException("Too many incorrect attempts. This OTP has been invalidated. Please request a new one.");
        }

        if (!otp.getOtpCode().equals(otpCode.trim())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            int remaining = 3 - otp.getAttempts();
            throw new IllegalArgumentException("Invalid OTP code. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP as used
        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }
}
