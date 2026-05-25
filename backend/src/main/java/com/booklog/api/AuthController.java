package com.booklog.api;

import com.booklog.config.KakaoProperties;
import com.booklog.domain.user.User;
import com.booklog.domain.user.UserRepository;
import com.booklog.common.enums.OAuthProvider;
import com.booklog.security.JwtProvider;
import com.booklog.service.KakaoOAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final KakaoOAuthService kakaoOAuthService;
    private final KakaoProperties kakaoProperties;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public AuthController(KakaoOAuthService kakaoOAuthService, KakaoProperties kakaoProperties, UserRepository userRepository, JwtProvider jwtProvider) {
        this.kakaoOAuthService = kakaoOAuthService;
        this.kakaoProperties = kakaoProperties;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @GetMapping("/kakao")
    public void kakaoRedirect(HttpServletResponse response) throws IOException {
        String redirectUri = "http://localhost:8080/api/v1/auth/kakao/callback";
        String url = "https://kauth.kakao.com/oauth/authorize?client_id=" + kakaoProperties.restApiKey() + "&redirect_uri=" + redirectUri + "&response_type=code";
        response.sendRedirect(url);
    }

    @GetMapping("/kakao/callback")
    public void kakaoCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        String redirectUri = "http://localhost:8080/api/v1/auth/kakao/callback";
        String kakaoAccessToken = kakaoOAuthService.getAccessToken(code, redirectUri);
        KakaoOAuthService.KakaoUserInfo userInfo = kakaoOAuthService.getUserInfo(kakaoAccessToken);

        User user = userRepository.findByProviderAndProviderId(OAuthProvider.KAKAO, userInfo.id())
                .orElseGet(() -> userRepository.save(User.builder()
                        .provider(OAuthProvider.KAKAO)
                        .providerId(userInfo.id())
                        .nickname(userInfo.nickname())
                        .profileImageUrl(userInfo.profileImage())
                        .build()));

        String accessToken = jwtProvider.generateAccessToken(user.getId(), "USER");
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(refreshCookie);

        // Redirect to frontend with access token in hash (or query param)
        response.sendRedirect("http://localhost:3000/login/oauth2/callback/kakao?token=" + accessToken);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken != null && jwtProvider.validateToken(refreshToken)) {
            Long userId = jwtProvider.getUserIdFromToken(refreshToken);
            String newAccessToken = jwtProvider.generateAccessToken(userId, "USER");
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
        return ResponseEntity.noContent().build();
    }
}
