package com.gifree.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.gifree.security.filter.JWTCheckFilter;
import com.gifree.security.handler.APILoginFailHandler;
import com.gifree.security.handler.APILoginSuccessHandler;
import com.gifree.security.handler.CustomAccessDeniedHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity// @PreAuthorize를 사용하려면 이게 설정이 되어있어야 한다. 
public class CustomSecurityConfig {

    @Bean
  public PasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
  }

@Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    
    log.info("---------------------security config---------------------------");

    http.cors(httpSecurityCorsConfigurer -> {
      httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
    });

    http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/events/**").permitAll()
    .requestMatchers("/api/donation/**").permitAll()  // 인증 없이 허용
    .anyRequest().authenticated()
);


    
    http.sessionManagement(sessionConfig ->  sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.csrf(config -> config.disable());
    http.formLogin(config ->{
      config.loginPage("/api/member/login");
      config.successHandler(new APILoginSuccessHandler());
      config.failureHandler(new APILoginFailHandler());
    });

    http.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class); //JWT 체크

     http.exceptionHandling(config -> {config.accessDeniedHandler(new CustomAccessDeniedHandler());
    });
    return http.build();
  }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }
  
}