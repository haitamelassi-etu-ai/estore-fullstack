package com.estore.catalog.controller;

import com.estore.catalog.dto.ProductDTO;
import com.estore.catalog.service.ProductService;
import com.estore.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProducts(@RequestParam(required = false) String keyword,
                                                                     @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(keyword, categoryId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }
}
