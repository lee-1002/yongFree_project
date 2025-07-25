package com.gifree.service;

import com.gifree.domain.Board;
import com.gifree.dto.BoardDTO;
import com.gifree.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardServiceImpl implements BoardService {

    private final BoardRepository repo;

    @Override
    public List<BoardDTO> list() {
        return repo.findAll().stream()
            .map(BoardDTO::fromEntity)
            .toList();
    }

    @Override
    public BoardDTO get(Long bno) {
        return repo.findById(bno)
            .map(BoardDTO::fromEntity)
            .orElseThrow(() -> new IllegalArgumentException("없는 글: " + bno));
    }

    @Override
    @Transactional
    public Long register(BoardDTO dto, List<MultipartFile> files) {
        // 파일 저장 제외하고 게시글만 저장
        Board b = Board.builder()
            .title(dto.getTitle())
            .content(dto.getContent())
            .writer(dto.getWriter())
            .build();
        //      // 2) 파일 저장 → uploadPath/boards 에 넣고, 반환값에서 "boards/파일명" → "파일명"만 추출
        // List<String> saved = fileUtil.saveFiles(files, "", "boards");
        // for (String fn : saved) {
        //     String onlyName = fn.substring(fn.indexOf('/') + 1);
        //     b.addImage(onlyName); 
        // }

        repo.save(b);
        return b.getBno();
    }

    @Override
    @Transactional
    public void modify(Long bno, BoardDTO dto, List<MultipartFile> files) {
        Board b = repo.findById(bno)
            .orElseThrow(() -> new IllegalArgumentException("없는 글: " + bno));
        b.setTitle(dto.getTitle());
        b.setContent(dto.getContent());

        //  // 기존 이미지 삭제 후 재저장
        //  b.clearImages();
        //  List<String> saved = fileUtil.saveFiles(files, "", "boards");
        //  for (String fn : saved) {
        //      String onlyName = fn.substring(fn.indexOf('/') + 1);
        //      b.addImage(onlyName);
        //  }
    }

    @Override
    @Transactional
    public void remove(Long bno) {
        repo.deleteById(bno);
    }
}