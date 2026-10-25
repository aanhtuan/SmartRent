package com.smartrent.identity.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrent.identity.application.*;
import com.smartrent.shared.api.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@Profile("!foundation-test")
public class ApiSecurityConfiguration {
  @Bean
  SecurityFilterChain apiSecurity(
      HttpSecurity http,
      IdentityQueries users,
      ObjectMapper json,
      @Value("${SMARTRENT_CORS_ORIGINS:}") String origins)
      throws Exception {
    var cors = new CorsConfiguration();
    var allowed =
        Arrays.stream(origins.split(",")).map(String::strip).filter(s -> !s.isEmpty()).toList();
    if (allowed.stream().anyMatch(s -> s.contains("*")))
      throw new IllegalStateException("CORS requires explicit origins.");
    cors.setAllowedOrigins(allowed);
    cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    cors.setAllowCredentials(false);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", cors);
    var corsFilter = new org.springframework.web.filter.CorsFilter(source);
    corsFilter.setCorsProcessor(
        new org.springframework.web.cors.DefaultCorsProcessor() {
          @Override
          protected void rejectRequest(org.springframework.http.server.ServerHttpResponse response)
              throws IOException {
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            response
                .getHeaders()
                .setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            json.writeValue(
                response.getBody(), ApiErrors.body("FORBIDDEN", "Origin is not allowed."));
            response.flush();
          }
        });
    http.addFilterBefore(corsFilter, org.springframework.security.web.csrf.CsrfFilter.class);
    http.cors(c -> c.disable())
        .csrf(c -> c.disable())
        .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .requestCache(c -> c.disable())
        .formLogin(c -> c.disable())
        .httpBasic(c -> c.disable())
        .logout(c -> c.disable());
    http.authorizeHttpRequests(
        c ->
            c.requestMatchers(org.springframework.http.HttpMethod.GET, "/actuator/health")
                .permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/login")
                .permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/register")
                .permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/forgot-password")
                .permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/reset-password")
                .permitAll()
                .requestMatchers("/api/**")
                .authenticated()
                .anyRequest()
                .denyAll());
    http.exceptionHandling(
        c ->
            c.authenticationEntryPoint(
                    (q, r, e) ->
                        ApiErrors.write(
                            r,
                            json,
                            q.getRequestURI().startsWith("/api/") ? 401 : 403,
                            q.getRequestURI().startsWith("/api/")
                                ? "UNAUTHENTICATED"
                                : "FORBIDDEN"))
                .accessDeniedHandler((q, r, e) -> ApiErrors.write(r, json, 403, "FORBIDDEN")));
    http.oauth2ResourceServer(
        c ->
            c.jwt(j -> {})
                .authenticationEntryPoint(
                    (q, r, e) -> ApiErrors.write(r, json, 401, "UNAUTHENTICATED")));
    http.addFilterAfter(
        new OncePerRequestFilter() {
          @Override
          protected void doFilterInternal(
              HttpServletRequest q, HttpServletResponse r, FilterChain chain)
              throws ServletException, IOException {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken token) {
              try {
                var a = users.active(UUID.fromString(token.getToken().getSubject()));
                var actor = new Actor(a.id(), a.role());
                SecurityContextHolder.getContext()
                    .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                            actor,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + a.role().name()))));
              } catch (Exception e) {
                SecurityContextHolder.clearContext();
                ApiErrors.write(r, json, 401, "UNAUTHENTICATED");
                return;
              }
            }
            chain.doFilter(q, r);
          }
        },
        BearerTokenAuthenticationFilter.class);
    return http.build();
  }
}
