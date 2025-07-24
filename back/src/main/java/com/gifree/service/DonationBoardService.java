package com.gifree.service;

import java.util.List;

import com.gifree.dto.DonationBoardDTO;
import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;

public interface DonationBoardService {
    Long register(DonationBoardDTO donationBoardDTO);
    
    DonationBoardDTO get(Long tno);
    
    void modify(DonationBoardDTO donationBoardDTO);

    void remove(Long tno);
    
    void addImageFiles(Long tno, List<String> fileNames);

    PageResponseDTO<DonationBoardDTO> list(PageRequestDTO pageRequestDTO);
}
