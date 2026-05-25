# BookLog ERD

## 엔티티 관계

```mermaid
erDiagram
  User ||--o{ UserBook : owns
  Book ||--o{ UserBook : referenced
  UserBook ||--o{ PageNote : has
  User ||--o{ BookCollection : creates
  BookCollection ||--o{ CollectionItem : contains
  UserBook ||--o{ CollectionItem : in
  User ||--o{ ReadingActivity : logs
  User ||--o{ Follow : follower
  User ||--o{ Follow : following

  User {
    bigint id PK
    string provider
    string provider_id UK
    string nickname
    string profile_image_url
    datetime created_at
  }

  Book {
    bigint id PK
    string isbn
    string title
    string author
    string cover_url
    int page_count
    string publisher
  }

  UserBook {
    bigint id PK
    bigint user_id FK
    bigint book_id FK
    enum status
    int current_page
    int total_pages_override
    decimal rating
    text review
    text one_liner
    date started_at
    date finished_at
    json tags
    enum visibility
  }

  PageNote {
    bigint id PK
    bigint user_book_id FK
    int page_number
    text content
  }

  BookCollection {
    bigint id PK
    bigint user_id FK
    string name
    text description
  }

  CollectionItem {
    bigint id PK
    bigint collection_id FK
    bigint user_book_id FK
    int sort_order
  }

  ReadingActivity {
    bigint id PK
    bigint user_id FK
    date activity_date
    enum activity_type
    bigint user_book_id FK
  }

  Follow {
    bigint id PK
    bigint follower_id FK
    bigint following_id FK
  }
```

## Enum

### ReadingStatus

- `WANT_TO_READ` — 읽고 싶음
- `READING` — 읽는 중
- `FINISHED` — 완독
- `DNF` — 읽다 멈춤

### Visibility (Phase 2)

- `PUBLIC` — 전체 공개
- `FOLLOWERS` — 팔로워만
- `PRIVATE` — 나만 보기 (기본값)

### ActivityType

- `PAGE_UPDATE`, `NOTE_ADDED`, `STATUS_CHANGED`, `FINISHED`
