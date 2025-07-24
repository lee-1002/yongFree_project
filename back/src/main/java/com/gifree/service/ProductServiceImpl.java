package com.gifree.service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gifree.domain.Product;
import com.gifree.domain.ProductImage;
import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;
import com.gifree.dto.ProductDTO;
import com.gifree.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public PageResponseDTO<ProductDTO> getList(PageRequestDTO pageRequestDTO) {

        log.info("getList..............");

        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1, // 페이지는 0부터 시작
                pageRequestDTO.getSize(),
                Sort.by("pno").descending());

                String keyword = pageRequestDTO.getKeyword();

        // Page<Object[]> result = productRepository.selectList(pageable);
        Page<Object[]> result = productRepository.selectList(pageable, keyword);

        List<ProductDTO> dtoList = result.get().map(arr -> {

            Product product = (Product) arr[0];
            ProductImage productImage = (ProductImage) arr[1];

            ProductDTO productDTO = ProductDTO.builder()
                    .pno(product.getPno())
                    .brand(product.getBrand())
                    .pname(product.getPname())
                    .price(product.getPrice())
                    .salePrice(product.getSalePrice())
                    .discountRate(product.getDiscountRate())
                    .pdesc(product.getPdesc())
                    .delFlag(product.isDelFlag())
                    .uploadFileNames(List.of(productImage.getFileName()))
                    .build();

            return productDTO;
        }).collect(Collectors.toList());

        long totalCount = result.getTotalElements();

        return PageResponseDTO.<ProductDTO>withAll()
                .dtoList(dtoList)
                .totalCount(totalCount)
                .pageRequestDTO(pageRequestDTO)
                .build();
    }

    @Override
    public Long register(ProductDTO productDTO) {
        Product product = dtoToEntity(productDTO);
        Product result = productRepository.save(product);
        return result.getPno();
    }

    private Product dtoToEntity(ProductDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("ProductDTO is null");
        }

        Product.ProductBuilder builder = Product.builder()
                .pno(dto.getPno())
                .brand(dto.getBrand())
                .pname(dto.getPname())
                .price(dto.getPrice())
                .salePrice(dto.getSalePrice())
                .discountRate(dto.getDiscountRate())
                .pdesc(dto.getPdesc())
                .delFlag(dto.isDelFlag());

        Product product = builder.build();

        List<String> uploadFileNames = dto.getUploadFileNames();
        if (uploadFileNames != null && !uploadFileNames.isEmpty()) {
            uploadFileNames.forEach(product::addImageString);
        }

        return product;
    }

    @Override
    public ProductDTO get(Long pno) {
        Optional<Product> result = productRepository.selectOne(pno);
        Product product = result.orElseThrow();
        return entityToDTO(product);
    }

    private ProductDTO entityToDTO(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product is null");
        }

        ProductDTO.ProductDTOBuilder builder = ProductDTO.builder()
                .pno(product.getPno())
                .brand(product.getBrand())
                .pname(product.getPname())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .discountRate(product.getDiscountRate())
                .pdesc(product.getPdesc())
                .delFlag(product.isDelFlag());

        List<ProductImage> imageList = product.getImageList();
        if (imageList != null && !imageList.isEmpty()) {
            List<String> fileNameList = imageList.stream()
                    .map(ProductImage::getFileName)
                    .collect(Collectors.toList());
            builder.uploadFileNames(fileNameList);
        }

        return builder.build();
    }

    @Override
    public void modify(ProductDTO dto) {
        Optional<Product> result = productRepository.findById(dto.getPno());
        Product product = result.orElseThrow();

        product.changeName(dto.getPname());
        product.changeDesc(dto.getPdesc());
        product.changePrice(dto.getPrice());

        // 새 필드도 업데이트
        product.changeBrand(dto.getBrand());
        product.changeSalePrice(dto.getSalePrice());
        product.changeDiscountRate(dto.getDiscountRate());

        product.clearList();

        List<String> uploadFileNames = dto.getUploadFileNames();
        if (uploadFileNames != null && !uploadFileNames.isEmpty()) {
            uploadFileNames.forEach(product::addImageString);
        }

        productRepository.save(product);
    }

    @Override
    public void remove(Long pno) {
        productRepository.updateToDelete(pno, true);
    }
 

}
