package com.gifree.service;

import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

import com.gifree.domain.Member;
import com.gifree.dto.MemberDTO;
import com.gifree.dto.MemberModifyDTO;

@Transactional
public interface MemberService {
    
    MemberDTO getKakaoMember(String accessToken);
  void modifyMember(MemberModifyDTO memberModifyDTO);

     default MemberDTO entityToDTO(Member member){
        
        MemberDTO dto = new MemberDTO(
            member.getEmail(),
             member.getPw(), 
             member.getNickname(), 
             member.isSocial(), 
             member.getMemberRoleList().stream().map(memberRole -> memberRole.name()).collect(Collectors.toList()));
        return dto;
    }
}