CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    provider_id VARCHAR(128) NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    profile_image_url VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_provider UNIQUE (provider, provider_id)
);

CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(64),
    title VARCHAR(512) NOT NULL,
    author VARCHAR(256) NOT NULL,
    cover_url VARCHAR(512),
    page_count INT,
    publisher VARCHAR(256),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    current_page INT NOT NULL DEFAULT 0,
    total_pages_override INT,
    rating DECIMAL(2, 1),
    review TEXT,
    one_liner VARCHAR(512),
    started_at DATE,
    finished_at DATE,
    tags JSON,
    visibility VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_books_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_books_book FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE page_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_book_id BIGINT NOT NULL,
    page_number INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_page_notes_user_book FOREIGN KEY (user_book_id) REFERENCES user_books(id) ON DELETE CASCADE
);

CREATE TABLE book_collections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE collection_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    collection_id BIGINT NOT NULL,
    user_book_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_collection_items_collection FOREIGN KEY (collection_id) REFERENCES book_collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_items_user_book FOREIGN KEY (user_book_id) REFERENCES user_books(id) ON DELETE CASCADE
);

CREATE TABLE reading_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_book_id BIGINT,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE follows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id),
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id),
    CONSTRAINT uk_follows UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_user_books_user_status ON user_books(user_id, status);
CREATE INDEX idx_reading_activities_user_date ON reading_activities(user_id, activity_date);
