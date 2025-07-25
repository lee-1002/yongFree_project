// src/main/java/com/gifree/service/OrderServiceImpl.java
package com.gifree.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gifree.domain.Order;
import com.gifree.domain.OrderItem;
import com.gifree.domain.Product;
import com.gifree.dto.OrderRequestDTO;
import com.gifree.dto.OrderResponseDTO;
import com.gifree.repository.OrderRepository;
import com.gifree.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    @Override
    public OrderResponseDTO placeOrder(OrderRequestDTO req) {
        // 1) Order 엔티티 생성
        Order order = Order.builder()
            .memberEmail(req.getMemberId())
            .couponCode(req.getCouponCode())
            .orderedAt(LocalDateTime.now())
            .build();

        // 2) OrderItem 생성·추가
        req.getItems().forEach(i -> {
            // 단가 조회
            Product product = productRepo.findById(i.getPno())
                .orElseThrow(() -> new IllegalArgumentException("Invalid pno"));
            int unitPrice = product.getPrice();

            OrderItem it = OrderItem.builder()
                .pno(i.getPno())
                .qty(i.getQty())
                .price(unitPrice)
                .build();
            order.addItem(it);

            // 3) 주문 즉시 상품 hidden 처리 (delFlag = true)
            productRepo.updateToDelete(i.getPno(), true);
        });

        orderRepo.save(order);
        return OrderResponseDTO.builder()
            .ono(order.getOno())
            .build();
    }

    @Override
    public void markProductsDeletedByReceipt(String receiptId) {
        // 1) receiptId 로 주문 조회 (OrderRepository 에 findByReceiptId 메서드가 있어야 합니다)
        Order order = orderRepo.findByReceiptId(receiptId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid receiptId: " + receiptId));

        // 2) 해당 주문의 모든 아이템에 대해 del_flag = true 처리
        for (OrderItem item : order.getItems()) {
            productRepo.updateToDelete(item.getPno(), true);
        }
    }
}
