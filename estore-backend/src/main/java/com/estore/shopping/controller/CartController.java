package com.estore.shopping.controller;

import com.estore.customer.entity.User;
import com.estore.customer.service.UserService;
import com.estore.shared.response.ApiResponse;
import com.estore.shopping.dto.AddToCartRequest;
import com.estore.shopping.dto.CartDTO;
import com.estore.shopping.dto.UpdateCartItemRequest;
import com.estore.shopping.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartDTO>> getCart(@PathVariable Long userId, Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId, authUser)));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartDTO>> addToCart(@Valid @RequestBody AddToCartRequest request,
                                                          Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cartService.addItem(authUser, request)));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItem(@Valid @RequestBody UpdateCartItemRequest request,
                                                                Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cartService.updateItem(authUser, request.itemId(), request.quantity())));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> removeCartItem(@PathVariable @NotNull @Positive Long itemId,
                                                               Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart item removed", cartService.removeItem(authUser, itemId)));
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<ApiResponse<CartDTO>> clearCart(@PathVariable Long userId, Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cartService.clearCart(userId, authUser)));
    }
}
