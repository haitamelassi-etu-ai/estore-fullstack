package com.estore.shopping.service;

import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shared.exception.InsufficientStockException;
import com.estore.shared.exception.ResourceNotFoundException;
import com.estore.shopping.dto.AddToCartRequest;
import com.estore.shopping.dto.CartDTO;
import com.estore.shopping.dto.CartItemDTO;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartItemRepository;
import com.estore.shopping.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public CartDTO getCart(Long userId, User authUser) {
        validateOwnership(userId, authUser);
        return toDTO(getOrCreateCart(userId));
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return cartRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .orElseGet(() -> cartRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                        .map(existingCart -> {
                            existingCart.setActive(true);
                            return cartRepository.save(existingCart);
                        })
                        .orElseGet(() -> cartRepository.save(Cart.builder().user(targetUser).active(true).build())));
    }

    @Transactional
    public CartDTO addItem(User authUser, AddToCartRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Inventory inventory = inventoryRepository.findByProductId(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        Cart cart = getOrCreateCart(authUser.getId());
        CartItem existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.productId()))
                .findFirst()
                .orElse(null);

        int requestedQuantity = request.quantity();
        if (existing != null) {
            requestedQuantity = existing.getQuantity() + request.quantity();
        }

        if (requestedQuantity > inventory.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
        }

        if (existing != null) {
            existing.setQuantity(requestedQuantity);
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .unitPrice(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateItem(User authUser, Long itemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserIdAndCartActiveTrue(itemId, authUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (quantity <= 0) {
            cartItem.getCart().getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
            return toDTO(getOrCreateCart(authUser.getId()));
        }
        Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        if (quantity > inventory.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for product: " + cartItem.getProduct().getName());
        }
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return toDTO(cartItem.getCart());
    }

    @Transactional
    public CartDTO removeItem(User authUser, Long itemId) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserIdAndCartActiveTrue(itemId, authUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        Cart cart = cartItem.getCart();
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO clearCart(Long userId, User authUser) {
        validateOwnership(userId, authUser);
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return toDTO(cartRepository.save(cart));
    }

    private void validateOwnership(Long targetUserId, User authUser) {
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (!isAdmin && !authUser.getId().equals(targetUserId)) {
            throw new AccessDeniedException("You cannot access another user's cart");
        }
    }

    public CartDTO toDTO(Cart cart) {
        List<CartItemDTO> itemDTOS = cart.getItems().stream().map(item -> {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemDTO.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .lineTotal(lineTotal)
                    .build();
        }).toList();

        int itemCount = itemDTOS.stream().mapToInt(CartItemDTO::quantity).sum();
        BigDecimal total = itemDTOS.stream()
                .map(CartItemDTO::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOS)
                .itemCount(itemCount)
                .totalAmount(total)
                .createdAt(cart.getCreatedAt())
                .build();
    }
}
