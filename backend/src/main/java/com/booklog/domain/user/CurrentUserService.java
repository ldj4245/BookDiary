package com.booklog.domain.user;

import com.booklog.api.dto.UpdateUserProfileRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }
        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(UpdateUserProfileRequest request) {
        User user = getCurrentUser();
        if (request.nickname() != null) {
            user.setNickname(request.nickname());
        }
        if (request.yearlyGoal() != null) {
            user.setYearlyGoal(request.yearlyGoal());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteCurrentUser() {
        User user = getCurrentUser();
        userRepository.delete(user);
    }
}
