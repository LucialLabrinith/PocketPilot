package com.pocketpilot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "platform", "PocketPilot Spring Boot 3 & Java 21",
                "database", "MySQL 8 / Relational Persistence",
                "otpDevMode", true,
                "timestamp", System.currentTimeMillis()
        ));
    }
}
