package com.booklog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booklog.cors")
public record CorsProperties(String allowedOrigins) {
}
