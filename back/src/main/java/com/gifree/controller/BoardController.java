// src/main/java/com/gifree/controller/BoardController.java
package com.gifree.controller;

import com.gifree.dto.BoardDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    /** 1) 전체 더미 게시글 조회 */
    @GetMapping
    public List<BoardDTO> listDummy() {
        return IntStream.rangeClosed(1, 30)
            .mapToObj(i -> {
                BoardDTO b = new BoardDTO();
                b.setId((long) i);
                b.setTitle("바꾸실분? (" + i + ")");
                b.setContent("스벅 5만원권");
                b.setCategory(List.of("member", "product", "bulk", "payment", "refund").get(i % 5));
                b.setNickname(i % 2 == 0 ? "user1" : "userN");
                b.setPno(100L);                                      // 수정: pno 고정값
                b.setBno(200L);                                      // 수정: bno 고정값
                b.setImageUrl("/sample" + (i % 5) + ".png");         // public/sampleX.png
                return b;
            })
            .toList();
    }

    /** 2) pno, bno 파라미터로 단건 조회 */
    @GetMapping("/byKey")
    public BoardDTO getByKey(@RequestParam Long pno,
                             @RequestParam Long bno) {
        BoardDTO b = new BoardDTO();
        b.setId(1L);
        b.setTitle("특정 게시물 조회");
        b.setContent("pno=" + pno + ", bno=" + bno + " 조회");
        b.setPno(pno);
        b.setBno(bno);
        b.setImageUrl("/sample0.png");
        return b;
    }
}
