package com.booklog.domain.user;

import com.booklog.common.enums.OAuthProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private static final OAuthProvider DEV_PROVIDER = OAuthProvider.KAKAO;
    private static final String DEV_PROVIDER_ID = "dev-kakao-user";

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User getCurrentUser() {
        return userRepository.findByProviderAndProviderId(DEV_PROVIDER, DEV_PROVIDER_ID)
                .orElseGet(() -> userRepository.save(User.builder()
                        .provider(DEV_PROVIDER)
                        .providerId(DEV_PROVIDER_ID)
                        .nickname("독서가")
                        .profileImageUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=booklog")
                        .build()));
    }
}
