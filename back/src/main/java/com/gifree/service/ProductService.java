package com.gifree.service;

import org.springframework.transaction.annotation.Transactional;

import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;
import com.gifree.dto.ProductDTO;

@Transactional
public interface ProductService {
    PageResponseDTO<ProductDTO> getList(PageRequestDTO pageRequestDTO);
     Long register(ProductDTO productDTO);
      ProductDTO get(Long pno);
      void modify(ProductDTO productDTO);
      void remove(Long pno);
      
}