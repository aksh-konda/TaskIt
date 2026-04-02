package com.iamak.taskit.auth;

import com.iamak.taskit.dto.AuthDtos;
import com.iamak.taskit.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    public AuthController(AuthService authService, CurrentUserService currentUserService) {
        this.authService = authService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/signup")
    public AuthDtos.AuthResponse signup(@Valid @RequestBody AuthDtos.SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthDtos.AuthResponse refresh(@Valid @RequestBody AuthDtos.RefreshRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) Map<String, String> payload) {
        authService.logout(payload == null ? null : payload.get("refreshToken"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public AuthDtos.UserSummary me() {
        return authService.me(currentUserService.getCurrentUser());
    }

    @GetMapping("/oauth/{provider}/start")
    public ResponseEntity<Map<String, String>> startOauth(@PathVariable String provider) {
        return ResponseEntity.ok(Map.of(
                "provider", provider,
                "message", "OAuth abstraction is implemented. Provider flow wiring is kept pluggable and can be connected to client IDs/secrets next."
        ));
    }

    @GetMapping("/oauth/{provider}/callback")
    public ResponseEntity<Void> oauthCallback(@PathVariable String provider, @RequestParam(required = false) String code) {
        URI redirect = URI.create("http://localhost:5173/login?oauth=" + provider + "&code=" + (code == null ? "" : code));
        return ResponseEntity.status(302).location(redirect).build();
    }
}
