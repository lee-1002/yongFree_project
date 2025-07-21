package com.gifree.controller;

import com.gifree.domain.Event;
import com.gifree.dto.EventDTO;
import com.gifree.dto.PageRequestDTO;
import com.gifree.dto.PageResponseDTO;
import com.gifree.service.EventService;

import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
@Log4j2
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

  @GetMapping
public ResponseEntity<PageResponseDTO<Event>> getEventList(PageRequestDTO requestDTO) {
    List<Event> list = eventService.getList(requestDTO);
    long total = eventService.getTotalCount();

    PageResponseDTO<Event> response = PageResponseDTO.<Event>withAll()
            .dtoList(list)
            .pageRequestDTO(requestDTO)
            .totalCount(total)
            .build();

    return ResponseEntity.ok(response);
}

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        log.info("단일 이벤트 조회 요청: id = {}", id);
        var eventOpt = eventService.getEventById(id);
        if(eventOpt.isEmpty()) {
            log.warn("이벤트를 찾을 수 없습니다. id = {}", id);
            return ResponseEntity.notFound().build();
        }
        log.info("이벤트 조회 성공: id = {}", id);
        return ResponseEntity.ok(eventOpt.get());
    }


    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody EventDTO dto) {
        Event event = convertToEntity(dto);
        return ResponseEntity.ok(eventService.createEvent(event));
    }
    

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody EventDTO eventDTO) {
        Event updatedEvent = convertToEntity(eventDTO);
        updatedEvent.setId(id);
        return ResponseEntity.ok(eventService.updateEvent(id, updatedEvent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Event> toggleEventStatus(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> {
                    event.setActive(!event.isActive());
                    return ResponseEntity.ok(eventService.updateEvent(id, event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    

    // DTO → Entity 변환 메서드
    private Event convertToEntity(EventDTO dto) {
        return Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .startDate(parseDateTime(dto.getStartDate()))
                .endDate(parseDateTime(dto.getEndDate()))
                .storeName(dto.getStoreName())           // 추가
                .storeAddress(dto.getStoreAddress()) 
                .isActive(dto.isActive())
                .build();
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) return null;
        return LocalDateTime.parse(dateTimeStr.replace(" ", "T"));
    }
}