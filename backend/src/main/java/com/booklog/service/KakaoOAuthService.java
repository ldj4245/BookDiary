package com.booklog.service;

import com.booklog.config.KakaoProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class KakaoOAuthService {

    private final KakaoProperties kakaoProperties;
    private final RestClient restClient;

    public KakaoOAuthService(KakaoProperties kakaoProperties, RestClient.Builder restClientBuilder) {
        this.kakaoProperties = kakaoProperties;
        this.restClient = restClientBuilder.build();
    }

    public String getAccessToken(String code, String redirectUri) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoProperties.restApiKey());
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        JsonNode response = restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(params)
                .retrieve()
                .body(JsonNode.class);

        if (response != null && response.has("access_token")) {
            return response.get("access_token").asText();
        }
        throw new RuntimeException("Failed to get Kakao access token");
    }

    public KakaoUserInfo getUserInfo(String accessToken) {
        JsonNode response = restClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(JsonNode.class);

        if (response != null && response.has("id")) {
            String id = response.get("id").asText();
            JsonNode properties = response.get("properties");
            String nickname = properties != null && properties.has("nickname") ? properties.get("nickname").asText() : "사용자";
            String profileImage = properties != null && properties.has("profile_image") ? properties.get("profile_image").asText() : null;
            return new KakaoUserInfo(id, nickname, profileImage);
        }
        throw new RuntimeException("Failed to get Kakao user info");
    }

    public record KakaoUserInfo(String id, String nickname, String profileImage) {}
}
