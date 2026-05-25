package com.booklog.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @GetMapping("/kakao")
    public ResponseEntity<Map<String, String>> kakao() {
        return ResponseEntity.ok(Map.of("message", "Kakao OAuth redirect stub"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        return ResponseEntity.ok(Map.of("accessToken", "stub-access-token"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
