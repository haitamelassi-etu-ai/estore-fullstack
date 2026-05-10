package com.estore.config;

import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import com.estore.mongodb.document.Review;
import com.estore.mongodb.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCatalogAndInventory();
        seedUsers();
        seedReviews();
    }

    private void seedCatalogAndInventory() {
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(List.of(
                    Category.builder().name("Laptops").description("Powerful laptops for work and gaming").build(),
                    Category.builder().name("Smartphones").description("Latest smartphones and accessories").build(),
                    Category.builder().name("Audio").description("Headphones, earbuds and speakers").build(),
                    Category.builder().name("Gaming").description("Consoles and gaming gear").build()
            ));
        }

        if (productRepository.count() == 0) {
            Category laptops = categoryRepository.findByName("Laptops").orElseThrow();
            Category smartphones = categoryRepository.findByName("Smartphones").orElseThrow();
            Category audio = categoryRepository.findByName("Audio").orElseThrow();
            Category gaming = categoryRepository.findByName("Gaming").orElseThrow();

            productRepository.saveAll(List.of(
                    Product.builder()
                            .name("MacBook Pro 14")
                            .description("Apple M3 Pro laptop with 18GB unified memory and 512GB SSD.")
                            .price(new BigDecimal("2199.00"))
                            .oldPrice(new BigDecimal("2399.00"))
                            .imageUrl("https://images.unsplash.com/photo-1517336714739-489689fd1ca8")
                            .badge("HOT")
                            .icon("laptop")
                            .rating(4.8)
                            .reviewCount(220)
                            .category(laptops)
                            .build(),
                    Product.builder()
                            .name("Galaxy S24")
                            .description("Samsung flagship smartphone with AI camera and AMOLED display.")
                            .price(new BigDecimal("999.00"))
                            .oldPrice(new BigDecimal("1099.00"))
                            .imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9")
                            .badge("NEW")
                            .icon("smartphone")
                            .rating(4.7)
                            .reviewCount(184)
                            .category(smartphones)
                            .build(),
                    Product.builder()
                            .name("Sony WH-1000XM5")
                            .description("Premium noise-cancelling wireless headphones.")
                            .price(new BigDecimal("349.00"))
                            .oldPrice(new BigDecimal("399.00"))
                            .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e")
                            .badge("TOP")
                            .icon("headphones")
                            .rating(4.9)
                            .reviewCount(312)
                            .category(audio)
                            .build(),
                    Product.builder()
                            .name("PlayStation 5")
                            .description("Next-generation gaming console with ultra-fast SSD.")
                            .price(new BigDecimal("549.00"))
                            .oldPrice(new BigDecimal("599.00"))
                            .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db")
                            .badge("BEST")
                            .icon("gamepad")
                            .rating(4.8)
                            .reviewCount(450)
                            .category(gaming)
                            .build()
            ));
        }

        if (inventoryRepository.count() == 0) {
            productRepository.findAll().forEach(product -> {
                int quantity = switch (product.getName()) {
                    case "MacBook Pro 14" -> 25;
                    case "Galaxy S24" -> 60;
                    case "Sony WH-1000XM5" -> 80;
                    case "PlayStation 5" -> 40;
                    default -> 20;
                };
                Inventory inventory = Inventory.builder()
                        .product(product)
                        .quantity(quantity)
                        .build();
                product.setInventory(inventory);
                inventoryRepository.save(inventory);
            });
        }
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = User.builder()
                .firstName("Admin")
                .lastName("Estore")
                .email("admin@estore.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role("ROLE_ADMIN")
                .build();
        admin.setProfile(Profile.builder()
                .phone("+212600000001")
                .address("1 Admin Avenue")
                .city("Casablanca")
                .country("Morocco")
                .build());

        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("user@estore.com")
                .password(passwordEncoder.encode("User@12345"))
                .role("ROLE_USER")
                .build();
        user.setProfile(Profile.builder()
                .phone("+212600000002")
                .address("2 User Street")
                .city("Rabat")
                .country("Morocco")
                .build());

        userRepository.saveAll(List.of(admin, user));
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) {
            return;
        }

        reviewRepository.saveAll(List.of(
                Review.builder()
                        .productId(1L)
                        .userId(2L)
                        .authorName("John Doe")
                        .rating(5)
                        .comment("Excellent laptop. Fast, silent, and perfect for development work.")
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .build(),
                Review.builder()
                        .productId(2L)
                        .userId(2L)
                        .authorName("John Doe")
                        .rating(4)
                        .comment("Great smartphone with a very smooth display and solid camera quality.")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build()
        ));
    }
}
