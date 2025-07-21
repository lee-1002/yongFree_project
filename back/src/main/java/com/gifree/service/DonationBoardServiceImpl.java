package com.gifree.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gifree.domain.DonationBoard;
import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;
import com.gifree.dto.DonationBoardDTO;
import com.gifree.repository.DonationBoardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor  // 생성자 자동 주입
public class DonationBoardServiceImpl implements DonationBoardService {

  //자동주입 대상은 final로 
  private final ModelMapper modelMapper;

  private final DonationBoardRepository donationBoardRepository;

  @Override
  public Long register(DonationBoardDTO donationBoardDTO) {
    
    log.info(".........");

    DonationBoard donationBoard = modelMapper.map(donationBoardDTO, DonationBoard.class);

    DonationBoard savedDonationBoard = donationBoardRepository.save(donationBoard);

    return savedDonationBoard.getTno();

  }
    @Override
  public DonationBoardDTO get(Long tno) {
    
    java.util.Optional<DonationBoard> result = donationBoardRepository.findById(tno);

    DonationBoard donationBoard = result.orElseThrow();

    DonationBoardDTO dto = modelMapper.map(donationBoard, DonationBoardDTO.class);

    return dto;
  }
    @Override
  public void modify(DonationBoardDTO donationBoardDTO) {

    Optional<DonationBoard> result = donationBoardRepository.findById(donationBoardDTO.getTno());

    DonationBoard donationBoard = result.orElseThrow();

    donationBoard.changeTitle(donationBoardDTO.getTitle());
    donationBoard.changeDueDate(donationBoardDTO.getDueDate());
    donationBoard.changeComplete(donationBoardDTO.isComplete());
 
    donationBoardRepository.save(donationBoard);

  }

  @Override
  public void remove(Long tno) {
    
    donationBoardRepository.deleteById(tno);

  }

  @Override
  public PageResponseDTO<DonationBoardDTO> list(PageRequestDTO pageRequestDTO) {

    Pageable pageable = 
      PageRequest.of( 
        pageRequestDTO.getPage() - 1 ,  // 1페이지가 0이므로 주의 
        pageRequestDTO.getSize(), 
        Sort.by("tno").descending());

    Page<DonationBoard> result = donationBoardRepository.findAll(pageable);    

    List<DonationBoardDTO> dtoList = result.getContent().stream()
      .map(donationBoard -> modelMapper.map(donationBoard, DonationBoardDTO.class))
      .collect(Collectors.toList());
    
    long totalCount = result.getTotalElements();

    PageResponseDTO<DonationBoardDTO> responseDTO = PageResponseDTO.<DonationBoardDTO>withAll()
      .dtoList(dtoList)
      .pageRequestDTO(pageRequestDTO)
      .totalCount(totalCount)
      .build();

    return responseDTO;
  }
}