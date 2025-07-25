package com.gifree.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_order_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long pno;
    private int qty;
    private int price;   // 단가

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}