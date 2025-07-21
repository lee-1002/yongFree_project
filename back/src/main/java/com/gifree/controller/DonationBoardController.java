package com.gifree.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;
import com.gifree.dto.DonationBoardDTO;
import com.gifree.service.DonationBoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;



@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/donationBoard")
public class DonationBoardController {

    private final DonationBoardService service;

    @GetMapping("/{tno}")
  public DonationBoardDTO get(@PathVariable(name ="tno") Long tno) {

    return service.get(tno);
  }

  @GetMapping("/list")
  public PageResponseDTO<DonationBoardDTO> list(PageRequestDTO pageRequestDTO ) {

    log.info(pageRequestDTO);

    return service.list(pageRequestDTO);
  }

      @PostMapping("/")
  public Map<String, Long> register(@RequestBody DonationBoardDTO donationBoardDTO){
   
    log.info("DonationBoardDTO: " + donationBoardDTO);

    Long tno = service.register(donationBoardDTO);
    
    return Map.of("TNO", tno);
  }
    @PutMapping("/{tno}")
  public Map<String, String> modify( 
    @PathVariable(name="tno") Long tno, 
    @RequestBody DonationBoardDTO donationBoardDTO) {

    donationBoardDTO.setTno(tno);

    log.info("Modify: " + donationBoardDTO);

    service.modify(donationBoardDTO);

    return Map.of("RESULT", "SUCCESS");
  }
      @DeleteMapping("/{tno}")
  public Map<String, String> remove( @PathVariable(name="tno") Long tno ){

    log.info("Remove:  " + tno);

    service.remove(tno);

    return Map.of("RESULT", "SUCCESS");
  }
}
