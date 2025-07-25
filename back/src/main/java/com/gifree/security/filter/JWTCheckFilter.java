package com.gifree.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.gson.Gson;
import com.gifree.dto.MemberDTO;
import com.gifree.util.JWTUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();

    log.info("check uri.......................{}", path);

    if ("GET".equalsIgnoreCase(request.getMethod()) && path.startsWith("/api/events/")) {
      return true;
  }

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
    if (path.startsWith("/api/member/")) return true;
    if (path.startsWith("/api/products/view/")) return true;
    if (path.startsWith("/api/events")) return true;
    if (path.startsWith("/api/donationBoard/")) return true;
    if (path.startsWith("/api/products/")) return true; 
    if (path.startsWith("/files/")) return true;
    if (path.startsWith("/api/order")) return true;
    if (path.startsWith("/api/boards")) return true;


    return false;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    log.info("------------------------JWTCheckFilter------------------");

    String authHeaderStr = request.getHeader("Authorization");

    log.info("Authorization Header: {}", authHeaderStr); // 헤더 값 확인

        if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
            log.warn("Authorization header missing or invalid for URI: {}", request.getRequestURI()); // 
            // 여기서 바로 401 에러 응답을 보냅니다.
            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN")); // 또는 "REQUIRE_LOGIN"
            //여기를 주의해서 봐볼것.


            
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
            return; // 요청 처리를 여기서 중단합니다.
        }

    try {
      // Bearer 토큰 추출
      String accessToken = authHeaderStr.substring(7);
      Map<String, Object> claims = JWTUtil.validateToken(accessToken);

      log.info("JWT claims: {}", claims);

      String email = (String) claims.get("email");
      String pw = (String) claims.get("pw");
      String nickname = (String) claims.get("nickname");
      Boolean social = (Boolean) claims.get("social");
      List<String> roleNames = (List<String>) claims.get("roleNames");

      MemberDTO memberDTO = new MemberDTO(email, pw, nickname, social, roleNames);

      log.info("Authenticated member: {}", memberDTO);

      UsernamePasswordAuthenticationToken authenticationToken =
          new UsernamePasswordAuthenticationToken(memberDTO, pw, memberDTO.getAuthorities());

      SecurityContextHolder.getContext().setAuthentication(authenticationToken);

      filterChain.doFilter(request, response);

    } catch (Exception e) {
      log.error("JWT Check Error: {}", e.getMessage());

      Gson gson = new Gson();
      String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      PrintWriter printWriter = response.getWriter();
      printWriter.println(msg);
      printWriter.close();
    }
  }
}
