package com.booklog.api;

import com.booklog.api.dto.UpdateUserProfileRequest;
import com.booklog.api.dto.UserDto;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.domain.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final CurrentUserService currentUserService;

    public UserController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public UserDto me() {
        return DtoMapper.toUserDto(currentUserService.getCurrentUser());
    }

    @PatchMapping("/me")
    public UserDto updateProfile(@Valid @RequestBody UpdateUserProfileRequest request) {
        return DtoMapper.toUserDto(currentUserService.updateProfile(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount() {
        currentUserService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
