package com.booklog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booklog.kakao")
public record KakaoProperties(String restApiKey) {

    public boolean hasRestApiKey() {
        return restApiKey != null && !restApiKey.isBlank();
    }
}
