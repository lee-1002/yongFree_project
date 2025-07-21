package com.gifree.service;

import com.gifree.domain.Event;
import com.gifree.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        System.out.println(">>> 이벤트 개수: " + events.size());
        return events;
    }

    @Override
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public Event updateEvent(Long id, Event updatedEvent) {
        return eventRepository.findById(id).map(event -> {
            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setImageUrl(updatedEvent.getImageUrl());
            event.setStartDate(updatedEvent.getStartDate());
            event.setEndDate(updatedEvent.getEndDate());
            event.setActive(updatedEvent.isActive());
            event.setStoreName(updatedEvent.getStoreName());
            event.setStoreAddress(updatedEvent.getStoreAddress());
            return eventRepository.save(event);
        }).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}