package com.pocketpilot.service;

import com.pocketpilot.dto.AuthResponse;
import com.pocketpilot.dto.LoginRequest;
import com.pocketpilot.dto.RegisterRequest;
import com.pocketpilot.dto.ResetPasswordRequest;
import com.pocketpilot.dto.VerifyOtpRequest;
import com.pocketpilot.model.User;
import com.pocketpilot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;

    // Active session store: token -> userId (also mirrored in persistent DB)
    private final ConcurrentHashMap<String, String> sessionStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, OtpService otpService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(("pocketpilot_salt_" + password).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new IllegalArgumentException("A valid email address is required.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }
        if (req.getFullName() == null || req.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email " + email + " already exists.");
        }

        String userId = UUID.randomUUID().toString();
        User user = new User(userId, email, hashPassword(req.getPassword()), req.getFullName().trim(), req.getCurrency());
        userRepository.save(user);

        // Generate Registration OTP
        String otpCode = otpService.generateAndSendOtp(email, "REGISTRATION");

        AuthResponse resp = new AuthResponse();
        resp.setUserId(userId);
        resp.setEmail(email);
        resp.setFullName(user.getFullName());
        resp.setCurrency(user.getCurrency());
        resp.setVerified(false);
        resp.setMessage("Account created. Please verify your email using the OTP sent to " + email);
        if (otpService.isDevMode()) {
            resp.setDevOtp(otpCode);
        }
        return resp;
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest req) {
        if (req.getEmail() == null || req.getOtpCode() == null) {
            throw new IllegalArgumentException("Email and OTP code are required.");
        }

        String email = req.getEmail().trim().toLowerCase();
        String purpose = req.getPurpose() != null ? req.getPurpose().toUpperCase() : "REGISTRATION";

        otpService.verifyOtp(email, req.getOtpCode(), purpose);

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        User user = optionalUser.get();
        if (!user.isVerified() && "REGISTRATION".equals(purpose)) {
            user.setVerified(true);
            userRepository.save(user);
        }

        // Generate session token for either Web or Desktop JavaFX client
        String token = "pp_" + UUID.randomUUID().toString().replace("-", "");
        sessionStore.put(token, user.getId());

        AuthResponse resp = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCurrency(),
                user.isVerified(),
                "Verification successful. Welcome to PocketPilot!"
        );
        return resp;
    }

    public AuthResponse login(LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        String email = req.getEmail().trim().toLowerCase();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User user = optionalUser.get();
        String hashed = hashPassword(req.getPassword());
        if (!hashed.equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (!user.isVerified()) {
            // Send new OTP for unverified account
            String otpCode = otpService.generateAndSendOtp(email, "REGISTRATION");
            AuthResponse resp = new AuthResponse();
            resp.setUserId(user.getId());
            resp.setEmail(user.getEmail());
            resp.setFullName(user.getFullName());
            resp.setCurrency(user.getCurrency());
            resp.setVerified(false);
            resp.setMessage("Please verify your email address before logging in. An OTP has been sent.");
            if (otpService.isDevMode()) {
                resp.setDevOtp(otpCode);
            }
            return resp;
        }

        String token = "pp_" + UUID.randomUUID().toString().replace("-", "");
        sessionStore.put(token, user.getId());

        AuthResponse resp = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCurrency(),
                user.isVerified(),
                "Login successful via " + (req.getClientType() != null ? req.getClientType() : "WEB")
        );
        return resp;
    }

    public void logout(String token) {
        if (token != null) {
            String cleanToken = token.replace("Bearer ", "").trim();
            sessionStore.remove(cleanToken);
        }
    }

    public String requestPasswordResetOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }
        String cleanEmail = email.trim().toLowerCase();
        Optional<User> user = userRepository.findByEmail(cleanEmail);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("No account registered with " + cleanEmail);
        }
        return otpService.generateAndSendOtp(cleanEmail, "PASSWORD_RESET");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (req.getEmail() == null || req.getOtpCode() == null || req.getNewPassword() == null) {
            throw new IllegalArgumentException("Email, OTP code and new password are required.");
        }
        if (req.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        String email = req.getEmail().trim().toLowerCase();
        otpService.verifyOtp(email, req.getOtpCode(), "PASSWORD_RESET");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(hashPassword(req.getNewPassword()));
        userRepository.save(user);
    }

    public Optional<User> authenticateToken(String token) {
        if (token == null) return Optional.empty();
        String cleanToken = token.replace("Bearer ", "").trim();
        String userId = sessionStore.get(cleanToken);
        if (userId == null) return Optional.empty();
        return userRepository.findById(userId);
    }
}
