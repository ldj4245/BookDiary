package com.booklog.config;

import com.booklog.common.enums.ActivityType;
import com.booklog.common.enums.ReadingStatus;
import com.booklog.domain.book.Book;
import com.booklog.domain.book.BookRepository;
import com.booklog.domain.collection.BookCollection;
import com.booklog.domain.collection.BookCollectionRepository;
import com.booklog.domain.note.PageNote;
import com.booklog.domain.note.PageNoteRepository;
import com.booklog.domain.stats.ReadingActivity;
import com.booklog.domain.stats.ReadingActivityRepository;
import com.booklog.domain.user.UserRepository;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import com.booklog.domain.userbook.UserBookRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@Profile({"local", "dev"})
public class LocalDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final UserBookRepository userBookRepository;
    private final PageNoteRepository pageNoteRepository;
    private final BookCollectionRepository collectionRepository;
    private final ReadingActivityRepository activityRepository;
    private final ObjectMapper objectMapper;

    public LocalDataSeeder(
            UserRepository userRepository,
            BookRepository bookRepository,
            UserBookRepository userBookRepository,
            PageNoteRepository pageNoteRepository,
            BookCollectionRepository collectionRepository,
            ReadingActivityRepository activityRepository,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.userBookRepository = userBookRepository;
        this.pageNoteRepository = pageNoteRepository;
        this.collectionRepository = collectionRepository;
        this.activityRepository = activityRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        User user = userRepository.findByProviderAndProviderId(com.booklog.common.enums.OAuthProvider.KAKAO, "dev-kakao-user")
                .orElseGet(() -> userRepository.save(User.builder()
                        .provider(com.booklog.common.enums.OAuthProvider.KAKAO)
                        .providerId("dev-kakao-user")
                        .nickname("독서가")
                        .profileImageUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=booklog")
                        .build()));

        if (!userBookRepository.findByUserId(user.getId()).isEmpty()) {
            return;
        }

        Book memory = bookRepository.save(Book.builder()
                .isbn("9788936434267")
                .title("살인자의 기억법")
                .author("김영하")
                .coverUrl("https://picsum.photos/seed/ub1/200/300")
                .pageCount(280)
                .publisher("문학동네")
                .build());
        Book kim = bookRepository.save(Book.builder()
                .isbn("9788934986302")
                .title("82년생 김지영")
                .author("조남주")
                .coverUrl("https://picsum.photos/seed/ub2/200/300")
                .pageCount(164)
                .publisher("민음사")
                .build());
        Book dream = bookRepository.save(Book.builder()
                .title("달러구트 꿈 백화점")
                .author("이미예")
                .coverUrl("https://picsum.photos/seed/ub3/200/300")
                .pageCount(288)
                .publisher("팩토리나인")
                .build());
        Book almond = bookRepository.save(Book.builder()
                .title("아몬드")
                .author("손원평")
                .coverUrl("https://picsum.photos/seed/ub4/200/300")
                .pageCount(267)
                .publisher("창비")
                .build());

        UserBook reading = saveUserBook(
                user,
                memory,
                ReadingStatus.READING,
                142,
                new BigDecimal("4.5"),
                "문장이 차갑고 정확하다. 인상 깊은 장면이 많다.",
                "기억과 살인의 경계",
                LocalDate.of(2026, 3, 1),
                null,
                List.of("소설", "한국문학"));
        UserBook finished = saveUserBook(
                user,
                kim,
                ReadingStatus.FINISHED,
                164,
                new BigDecimal("4.0"),
                "짧지만 강한 메시지. 현실을 직면하게 만든다.",
                "읽기 쉬운, 무거운 이야기",
                LocalDate.of(2026, 1, 10),
                LocalDate.of(2026, 1, 18),
                List.of("소설", "사회"));
        saveUserBook(
                user,
                dream,
                ReadingStatus.WANT_TO_READ,
                0,
                null,
                null,
                null,
                null,
                null,
                List.of("판타지", "힐링"));
        saveUserBook(
                user,
                almond,
                ReadingStatus.DNF,
                80,
                new BigDecimal("3.0"),
                null,
                "나중에 다시",
                LocalDate.of(2025, 11, 1),
                null,
                List.of("청소년", "성장"));

        pageNoteRepository.save(PageNote.builder()
                .userBook(reading)
                .pageNumber(42)
                .content("기억이 사라진 자리에 남는 것은 습관일지도 모른다.")
                .build());
        pageNoteRepository.save(PageNote.builder()
                .userBook(reading)
                .pageNumber(121)
                .content("짧은 문장이 장면을 더 차갑게 만든다.")
                .build());

        collectionRepository.save(BookCollection.builder()
                .user(user)
                .name("올해 오래 남은 책")
                .description("다시 펼쳐볼 문장이 있던 책들")
                .build());

        seedActivities(user, reading, finished);
    }

    private UserBook saveUserBook(
            User user,
            Book book,
            ReadingStatus status,
            int currentPage,
            BigDecimal rating,
            String review,
            String oneLiner,
            LocalDate startedAt,
            LocalDate finishedAt,
            List<String> tags
    ) throws Exception {
        return userBookRepository.save(UserBook.builder()
                .user(user)
                .book(book)
                .status(status)
                .currentPage(currentPage)
                .rating(rating)
                .review(review)
                .oneLiner(oneLiner)
                .startedAt(startedAt)
                .finishedAt(finishedAt)
                .tags(objectMapper.writeValueAsString(tags))
                .build());
    }

    private void seedActivities(User user, UserBook reading, UserBook finished) {
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 96; i += 3) {
            UserBook target = i % 2 == 0 ? reading : finished;
            activityRepository.save(ReadingActivity.builder()
                    .user(user)
                    .userBook(target)
                    .activityDate(today.minusDays(i))
                    .activityType(i % 9 == 0 ? ActivityType.NOTE_ADDED : ActivityType.PAGE_UPDATE)
                    .build());
        }
    }
}
