package com.pocketpilot.desktop;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;

import java.net.http.HttpResponse;

/**
 * PocketPilot JavaFX Desktop Application
 * Authentic desktop personal finance client connecting to the shared backend database.
 */
public class PocketPilotDesktopApp extends Application {

    private final ApiClient apiClient = new ApiClient("http://localhost:8080/api");
    private Stage primaryStage;

    private TextField emailField;
    private PasswordField passwordField;
    private TextField fullNameField;
    private Label statusLabel;
    private Label devOtpBanner;

    @Override
    public void start(Stage stage) {
        this.primaryStage = stage;
        stage.setTitle("PocketPilot — Personal Finance Desktop Client");

        showLoginScene();
        stage.show();
    }

    private void showLoginScene() {
        VBox root = new VBox(14);
        root.setPadding(new Insets(30));
        root.setAlignment(Pos.CENTER);
        root.setStyle("-fx-background-color: #0f172a; -fx-font-family: 'Segoe UI', sans-serif;");

        Label title = new Label("PocketPilot Desktop");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: bold; -fx-text-fill: #38bdf8;");

        Label subtitle = new Label("Personal Finance Management Platform");
        subtitle.setStyle("-fx-font-size: 13px; -fx-text-fill: #94a3b8;");

        devOtpBanner = new Label("");
        devOtpBanner.setWrapText(true);
        devOtpBanner.setStyle("-fx-background-color: #1e293b; -fx-text-fill: #fbbf24; -fx-padding: 8px; -fx-border-color: #f59e0b; -fx-border-radius: 4px;");
        devOtpBanner.setVisible(false);

        VBox form = new VBox(10);
        form.setMaxWidth(380);

        Label emailLbl = new Label("Email Address");
        emailLbl.setStyle("-fx-text-fill: #cbd5e1;");
        emailField = new TextField();
        emailField.setPromptText("you@example.com");
        emailField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px;");

        Label pwdLbl = new Label("Password");
        pwdLbl.setStyle("-fx-text-fill: #cbd5e1;");
        passwordField = new PasswordField();
        passwordField.setPromptText("Enter your password");
        passwordField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px;");

        Button loginBtn = new Button("Sign In to Desktop");
        loginBtn.setMaxWidth(Double.MAX_VALUE);
        loginBtn.setStyle("-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10px; -fx-cursor: hand;");
        loginBtn.setOnAction(e -> handleLogin());

        Button registerNavBtn = new Button("Create New Account with Email OTP");
        registerNavBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #38bdf8; -fx-underline: true; -fx-cursor: hand;");
        registerNavBtn.setOnAction(e -> showRegisterScene());

        statusLabel = new Label("Connected to Backend API: http://localhost:8080/api");
        statusLabel.setStyle("-fx-text-fill: #64748b; -fx-font-size: 11px;");

        form.getChildren().addAll(emailLbl, emailField, pwdLbl, passwordField, loginBtn, registerNavBtn);
        root.getChildren().addAll(title, subtitle, devOtpBanner, form, statusLabel);

        Scene scene = new Scene(root, 480, 560);
        primaryStage.setScene(scene);
    }

    private void showRegisterScene() {
        VBox root = new VBox(12);
        root.setPadding(new Insets(25));
        root.setAlignment(Pos.CENTER);
        root.setStyle("-fx-background-color: #0f172a;");

        Label title = new Label("Create PocketPilot Account");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #38bdf8;");

        fullNameField = new TextField();
        fullNameField.setPromptText("Full Name");
        fullNameField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px;");

        emailField = new TextField();
        emailField.setPromptText("Email");
        emailField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px;");

        passwordField = new PasswordField();
        passwordField.setPromptText("Password (min 6 characters)");
        passwordField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px;");

        Button regBtn = new Button("Send Verification OTP");
        regBtn.setMaxWidth(Double.MAX_VALUE);
        regBtn.setStyle("-fx-background-color: #059669; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10px;");
        regBtn.setOnAction(e -> handleRegister());

        Button backBtn = new Button("Back to Login");
        backBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #94a3b8;");
        backBtn.setOnAction(e -> showLoginScene());

        VBox form = new VBox(10, fullNameField, emailField, passwordField, regBtn, backBtn);
        form.setMaxWidth(380);

        root.getChildren().addAll(title, form);
        primaryStage.setScene(new Scene(root, 480, 560));
    }

    private void handleLogin() {
        String email = emailField.getText();
        String pwd = passwordField.getText();
        new Thread(() -> {
            try {
                HttpResponse<String> resp = apiClient.login(email, pwd);
                Platform.runLater(() -> {
                    if (resp.statusCode() == 200) {
                        statusLabel.setText("Login successful! Welcome to PocketPilot.");
                        statusLabel.setStyle("-fx-text-fill: #34d399;");
                    } else {
                        statusLabel.setText("Login failed: " + resp.body());
                        statusLabel.setStyle("-fx-text-fill: #f87171;");
                    }
                });
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    statusLabel.setText("Backend connection error: " + ex.getMessage());
                    statusLabel.setStyle("-fx-text-fill: #f87171;");
                });
            }
        }).start();
    }

    private void handleRegister() {
        String email = emailField.getText();
        String pwd = passwordField.getText();
        String name = fullNameField.getText();
        new Thread(() -> {
            try {
                HttpResponse<String> resp = apiClient.register(email, pwd, name, "USD");
                Platform.runLater(() -> {
                    if (resp.statusCode() == 200) {
                        showOtpScene(email, "REGISTRATION", "Registration OTP sent! Enter code below:");
                    } else {
                        Alert alert = new Alert(Alert.AlertType.ERROR, "Registration failed: " + resp.body());
                        alert.show();
                    }
                });
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    Alert alert = new Alert(Alert.AlertType.ERROR, "Network error: " + ex.getMessage());
                    alert.show();
                });
            }
        }).start();
    }

    private void showOtpScene(String email, String purpose, String message) {
        VBox root = new VBox(14);
        root.setPadding(new Insets(25));
        root.setAlignment(Pos.CENTER);
        root.setStyle("-fx-background-color: #0f172a;");

        Label title = new Label("Verify Email OTP");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #38bdf8;");

        Label info = new Label(message);
        info.setStyle("-fx-text-fill: #94a3b8;");

        TextField otpInput = new TextField();
        otpInput.setPromptText("Enter 6-digit OTP code");
        otpInput.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-padding: 8px; -fx-font-size: 16px;");

        Button verifyBtn = new Button("Confirm & Enter");
        verifyBtn.setStyle("-fx-background-color: #2563eb; -fx-text-fill: white; -fx-padding: 10px;");
        verifyBtn.setOnAction(e -> {
            new Thread(() -> {
                try {
                    HttpResponse<String> resp = apiClient.verifyOtp(email, otpInput.getText(), purpose);
                    Platform.runLater(() -> {
                        if (resp.statusCode() == 200) {
                            showLoginScene();
                            statusLabel.setText("Account verified successfully! Please log in.");
                            statusLabel.setStyle("-fx-text-fill: #34d399;");
                        } else {
                            info.setText("Invalid or expired OTP: " + resp.body());
                            info.setStyle("-fx-text-fill: #f87171;");
                        }
                    });
                } catch (Exception ex) {
                    Platform.runLater(() -> info.setText("Verification error: " + ex.getMessage()));
                }
            }).start();
        });

        root.getChildren().addAll(title, info, otpInput, verifyBtn);
        primaryStage.setScene(new Scene(root, 480, 560));
    }

    public static void main(String[] args) {
        launch(args);
    }
}
