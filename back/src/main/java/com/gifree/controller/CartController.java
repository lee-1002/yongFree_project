// src/main/java/com/gifree/controller/CartController.java
package com.gifree.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gifree.dto.CartItemDTO;
import com.gifree.dto.CartItemListDTO;
import com.gifree.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @PreAuthorize("isAuthenticated()")
@PostMapping("/change")
public List<CartItemListDTO> changeCart(@RequestBody CartItemDTO itemDTO, 
                                        Principal principal) {

    log.info(itemDTO);
    itemDTO.setEmail(principal.getName()); // 🔐 인증된 사용자 email 강제 설정

    if(itemDTO.getQty() <= 0) {
        return cartService.remove(itemDTO.getCino());
    }

    return cartService.addOrModify(itemDTO);
}

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
  @GetMapping("/items")
  public List<CartItemListDTO> getCartItems(Principal principal){

    String email = principal.getName();
    log.info("-------------------------");
    log.info("email: "+ email);

    return cartService.getCartItems(email);
  }
  @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
  @DeleteMapping("/{cino}")
  public List<CartItemListDTO> removeFromCart(@PathVariable("cino") Long cino){
    log.info("cart item no: "+ cino);

    return cartService.remove(cino);
  }
}