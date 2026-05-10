package com.estore.catalog.service;

import com.estore.catalog.dto.CategoryDTO;
import com.estore.catalog.dto.ProductDTO;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDTO> getAllProducts(String keyword, Long categoryId) {
        List<Product> products;
        boolean hasKeyword = keyword != null && !keyword.isBlank();

        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
            if (hasKeyword) {
                String lowered = keyword.toLowerCase();
                products = products.stream()
                        .filter(product -> product.getName().toLowerCase().contains(lowered)
                                || product.getDescription().toLowerCase().contains(lowered))
                        .toList();
            }
        } else if (hasKeyword) {
            products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
        } else {
            products = productRepository.findAll();
        }

        return products.stream().map(this::toDTO).toList();
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toDTO(product);
    }

    public Product getProductEntity(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public ProductDTO toDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .oldPrice(product.getOldPrice())
                .imageUrl(product.getImageUrl())
                .icon(product.getIcon())
                .badge(product.getBadge())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .category(toCategoryDTO(product))
                .inventoryQuantity(product.getInventory() != null ? product.getInventory().getQuantity() : 0)
                .build();
    }

    private CategoryDTO toCategoryDTO(Product product) {
        return CategoryDTO.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .build();
    }
}
