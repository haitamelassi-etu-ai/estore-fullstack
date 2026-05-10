package com.estore.inventory.controller;

import com.estore.inventory.dto.InventoryDTO;
import com.estore.inventory.service.InventoryService;
import com.estore.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<InventoryDTO>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getByProductId(productId)));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<InventoryDTO>> updateByProduct(@PathVariable Long productId,
                                                                      @Valid @RequestBody InventoryDTO inventoryDTO) {
        InventoryDTO updated = inventoryService.updateInventory(productId, inventoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", updated));
    }
}
