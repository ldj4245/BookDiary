package com.booklog.infra;

import com.booklog.api.dto.BookSearchResultDto;
import com.booklog.config.KakaoProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.StreamSupport;

@Component
public class KakaoSearchBookClient implements KakaoBookClient {

    private final KakaoProperties kakaoProperties;
    private final RestClient restClient;

    public KakaoSearchBookClient(
            KakaoProperties kakaoProperties,
            RestClient.Builder restClientBuilder
    ) {
        this.kakaoProperties = kakaoProperties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public List<BookSearchResultDto> search(String query, String type) {
        if (!kakaoProperties.hasRestApiKey() || query == null || query.isBlank()) {
            return List.of();
        }
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("dapi.kakao.com")
                            .path("/v3/search/book")
                            .queryParam("query", query.trim())
                            .queryParam("target", toKakaoTarget(type))
                            .queryParam("size", 10)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoProperties.restApiKey())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null || !response.has("documents")) {
                return List.of();
            }
            return StreamSupport.stream(response.get("documents").spliterator(), false)
                    .map(this::toDto)
                    .filter(dto -> dto.title() != null && !dto.title().isBlank())
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private String toKakaoTarget(String type) {
        return switch (type) {
            case "author" -> "person";
            case "isbn" -> "isbn";
            default -> "title";
        };
    }

    private BookSearchResultDto toDto(JsonNode document) {
        String isbn = text(document, "isbn");
        String title = text(document, "title");
        String author = authors(document);
        String thumbnail = text(document, "thumbnail");
        String publisher = text(document, "publisher");
        return new BookSearchResultDto(
                kakaoDerivedId(isbn, title, author),
                isbn.isBlank() ? null : isbn,
                title,
                author.isBlank() ? "저자 미상" : author,
                thumbnail.isBlank() ? null : thumbnail,
                null,
                publisher.isBlank() ? null : publisher,
                "kakao");
    }

    private Long kakaoDerivedId(String isbn, String title, String author) {
        String key = isbn == null || isbn.isBlank() ? title + ":" + author : isbn;
        return Integer.toUnsignedLong(key.hashCode());
    }

    private String text(JsonNode document, String fieldName) {
        JsonNode node = document.get(fieldName);
        return node == null || node.isNull() ? "" : node.asText("");
    }

    private String authors(JsonNode document) {
        JsonNode authors = document.get("authors");
        if (authors == null || !authors.isArray()) {
            return "";
        }
        return StreamSupport.stream(authors.spliterator(), false)
                .map(author -> author.asText(""))
                .filter(author -> !author.isBlank())
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
    }
}
