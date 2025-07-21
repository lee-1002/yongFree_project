import axios from "axios";
import { API_SERVER_HOST } from "./todoApi"; // 예: http://localhost:8080

const host = `${API_SERVER_HOST}/api/events`;

// 이벤트 목록 조회
export const getEvents = async (page = 1, size = 10) => {
  const res = await axios.get(`${host}?page=${page}&size=${size}`);
  return res.data;
};

// 단일 이벤트 조회
export const getEventById = async (id) => {
  const res = await axios.get(`${host}/${id}`);
  return res.data;
};

// 이벤트 등록
export const addEvent = async (eventData) => {
  const res = await axios.post(host, eventData);
  return res.data;
};

// 이벤트 수정
export const modifyEvent = async (id, eventData) => {
  const res = await axios.put(`${host}/${id}`, eventData);
  return res.data;
};

// 이벤트 삭제
export const deleteEventById = async (id) => {
  const res = await axios.delete(`${host}/${id}`);
  return res.data;
};

// 이벤트 활성화/비활성화 토글
export const patchToggleEventStatus = async (id) => {
  const res = await axios.patch(`${host}/${id}/toggle`);
  return res.data;
};
