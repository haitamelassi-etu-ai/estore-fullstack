package com.estore.billing.service;

import com.estore.billing.dto.OrderDTO;
import com.estore.billing.dto.OrderItemDTO;
import com.estore.billing.entity.Order;
import com.estore.billing.entity.OrderItem;
import com.estore.billing.entity.OrderStatus;
import com.estore.billing.repository.OrderRepository;
import com.estore.customer.entity.User;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shared.exception.InsufficientStockException;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public OrderDTO placeOrder(Long userId, String shippingAddress, User authUser) {
        validateOwnership(userId, authUser);
        Cart cart = cartRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        if (cart.getItems().isEmpty()) {
            throw new ResourceNotFoundException("Cart is empty");
        }

        List<CartItem> cartItems = new ArrayList<>(cart.getItems());
        for (CartItem cartItem : cartItems) {
            Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
            if (cartItem.getQuantity() > inventory.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + cartItem.getProduct().getName());
            }
        }

        Order order = Order.builder()
                .user(cart.getUser())
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddress.trim())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
            inventory.setQuantity(inventory.getQuantity() - cartItem.getQuantity());
            inventoryRepository.save(inventory);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();
            order.getItems().add(orderItem);
            total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        cart.setActive(false);
        cartRepository.save(cart);

        return toDTO(saved);
    }

    public List<OrderDTO> getUserOrders(Long userId, User authUser) {
        validateOwnership(userId, authUser);
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public OrderDTO getOrderById(Long orderId, User authUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (!isAdmin && !order.getUser().getId().equals(authUser.getId())) {
            throw new AccessDeniedException("You cannot access another user's order");
        }
        return toDTO(order);
    }

    private void validateOwnership(Long targetUserId, User authUser) {
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (!isAdmin && !authUser.getId().equals(targetUserId)) {
            throw new AccessDeniedException("You cannot access another user's orders");
        }
    }

    public OrderDTO toDTO(Order order) {
        List<OrderItemDTO> orderItems = order.getItems().stream().map(item -> OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build()
        ).toList();

        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .items(orderItems)
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .build();
    }
}
