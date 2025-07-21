import { useState, useEffect } from "react";
import { getEvents, addEvent as apiAddEvent, patchToggleEventStatus, deleteEventById } from "../api/eventApi";

const useCustomEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvents();
        setEvents(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 이벤트 추가
  const addEvent = async (newEventData) => {
    setError(null);
    try {
      const createdEvent = await apiAddEvent(newEventData);
      setEvents((prev) => [...prev, createdEvent]);
    } catch (e) {
      setError(e.message);
    }
  };

  // 이벤트 활성화/비활성화 토글
  const toggleEvent = async (id) => {
    setError(null);
    try {
      const updatedEvent = await patchToggleEventStatus(id);
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? updatedEvent : event))
      );
    } catch (e) {
      setError(e.message);
    }
  };

  // 이벤트 삭제
  const deleteEvent = async (id) => {
    setError(null);
    try {
      await deleteEventById(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return { events, loading, error, addEvent, toggleEvent, deleteEvent };
};

export default useCustomEvent;