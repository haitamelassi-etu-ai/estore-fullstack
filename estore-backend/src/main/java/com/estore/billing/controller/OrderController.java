package com.estore.billing.controller;

import com.estore.billing.dto.OrderDTO;
import com.estore.billing.dto.PlaceOrderRequest;
import com.estore.billing.service.OrderService;
import com.estore.customer.entity.User;
import com.estore.customer.service.UserService;
import com.estore.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> placeOrder(@Valid @RequestBody PlaceOrderRequest request,
                                                            Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        OrderDTO orderDTO = orderService.placeOrder(request.userId(), request.shippingAddress(), authUser);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orderDTO));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getUserOrders(@PathVariable Long userId,
                                                                     Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userId, authUser)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getById(@PathVariable Long id, Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id, authUser)));
    }
}
