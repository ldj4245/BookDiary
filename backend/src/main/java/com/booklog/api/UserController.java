package com.booklog.api;

import com.booklog.api.dto.UserDto;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.domain.user.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
