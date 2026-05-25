package com.booklog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booklog.jwt")
public record JwtProperties(
        String secret,
        long accessExpirationMs,
        long refreshExpirationMs
) {
}
