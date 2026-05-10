package com.estore.shopping.repository;

import com.estore.shopping.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByIdAndCartUserIdAndCartActiveTrue(Long itemId, Long userId);
}
