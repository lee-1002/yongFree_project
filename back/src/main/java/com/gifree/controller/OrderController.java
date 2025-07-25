// src/main/java/com/gifree/controller/OrderController.java
package com.gifree.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gifree.dto.OrderRequestDTO;
import com.gifree.dto.OrderResponseDTO;
import com.gifree.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;  // ← 기존 ProductRepository, OrderRepository는 더 이상 직접 쓰지 않습니다

    @PostMapping
    public ResponseEntity<OrderResponseDTO> placeOrder(
            @RequestBody OrderRequestDTO req) {

        // 1) Service 레이어에 요청을 위임 (트랜잭션 포함)
        OrderResponseDTO resp = orderService.placeOrder(req);

        // 2) 주문번호를 응답
        return ResponseEntity.ok(resp);
    }
}
