// src/main/java/com/gifree/service/OrderService.java
package com.gifree.service;

import com.gifree.dto.OrderRequestDTO;
import com.gifree.dto.OrderResponseDTO;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderRequestDTO req);

    /**
     * BootPay 결제 검증 후, 해당 receiptId 로 연결된 주문의 상품들 del_flag = true 처리
     */
    void markProductsDeletedByReceipt(String receiptId);
}
