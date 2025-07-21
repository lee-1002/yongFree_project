package com.gifree.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Component
@Log4j2
@RequiredArgsConstructor
public class CustomFileUtil {

  @Value("${com.gifree.upload.path}")
  private String uploadPath;

  @PostConstruct
  public void init() {
    File uploadFolder = new File(uploadPath);
    if (!uploadFolder.exists()) {
      uploadFolder.mkdirs();
    }
    log.info("uploadPath = " + uploadPath);
  }

  public List<String> saveFiles(List<MultipartFile> files) {
    if (files == null || files.isEmpty()) return Collections.emptyList();

    List<String> savedFileNames = new ArrayList<>();

    for (MultipartFile file : files) {
      String uuid = UUID.randomUUID().toString();
      String originalName = sanitizeFileName(file.getOriginalFilename());
      String savedName = uuid + "_" + originalName;

      Path savePath = Paths.get(uploadPath, savedName);

      try {
        Files.copy(file.getInputStream(), savePath);

        if (file.getContentType() != null && file.getContentType().startsWith("image")) {
          Path thumbnailPath = Paths.get(uploadPath, "s_" + savedName);
          Thumbnails.of(savePath.toFile()).size(200, 200).toFile(thumbnailPath.toFile());
        }

        savedFileNames.add(savedName);

      } catch (IOException e) {
        throw new RuntimeException("파일 저장 실패: " + e.getMessage());
      }
    }

    return savedFileNames;
  }

  public ResponseEntity<Resource> getFile(String filename) {
    Resource resource = new FileSystemResource(uploadPath + File.separator + filename);

    if (!resource.exists() || !resource.isReadable()) {
      return ResponseEntity.notFound().build();
    }

    HttpHeaders headers = new HttpHeaders();
    try {
      headers.add("Content-Type", Files.probeContentType(resource.getFile().toPath()));
    } catch (IOException e) {
      return ResponseEntity.internalServerError().build();
    }

    return ResponseEntity.ok().headers(headers).body(resource);
  }

  public void deleteFiles(List<String> fileNames) {
    if (fileNames == null || fileNames.isEmpty()) return;

    for (String fileName : fileNames) {
      Path filePath = Paths.get(uploadPath, fileName);
      Path thumbnailPath = Paths.get(uploadPath, "s_" + fileName);
      try {
        Files.deleteIfExists(filePath);
        Files.deleteIfExists(thumbnailPath);
      } catch (IOException e) {
        throw new RuntimeException("파일 삭제 실패: " + e.getMessage());
      }
    }
  }

  /**
   * 파일명에서 OS/보안상 위험한 문자 제거
   * (한글, 영문, 숫자, 일부 기호 허용: . _ - 공백)
   */
  private String sanitizeFileName(String originalName) {
    if (originalName == null) return "unnamed";

    // 디렉토리 이동 문자, Windows 예약 문자 제거
    String cleaned = originalName.replaceAll("[\\\\/:*?\"<>|]", "_");

    // 너무 긴 이름은 자르기
    if (cleaned.length() > 200) {
      cleaned = cleaned.substring(0, 200);
    }

    return cleaned.trim();
  }
}
