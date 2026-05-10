package com.estore.inventory.service;

import com.estore.catalog.entity.Product;
import com.estore.catalog.service.ProductService;
import com.estore.inventory.dto.InventoryDTO;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductService productService;

    public InventoryDTO getByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        return toDTO(inventory);
    }

    @Transactional
    public InventoryDTO updateInventory(Long productId, InventoryDTO inventoryDTO) {
        Product product = productService.getProductEntity(productId);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder().product(product).quantity(0).build());
        inventory.setQuantity(inventoryDTO.quantity());
        return toDTO(inventoryRepository.save(inventory));
    }

    public InventoryDTO toDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct().getId())
                .quantity(inventory.getQuantity())
                .build();
    }
}
