package com.booklog.infra;

import com.booklog.api.dto.BookSearchResultDto;

import java.util.List;

public interface KakaoBookClient {

    List<BookSearchResultDto> search(String query, String type);
}
