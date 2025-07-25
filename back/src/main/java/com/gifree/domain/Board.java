package com.gifree.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbl_board")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Board {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bno;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    private String content;

    @Column(nullable = false, length = 50)
    private String writer;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @Column(name = "mod_date")
    private LocalDateTime modDate;

    @Column(name = "view_count", nullable = false)
    private int viewCount;
    
    
    @PrePersist
    public void prePersist() {
        this.regDate   = LocalDateTime.now();
        this.modDate   = LocalDateTime.now();
        this.viewCount = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.modDate = LocalDateTime.now();
    }

   
}
