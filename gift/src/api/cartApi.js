import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./todoApi";

//locolhost:8080/api/cart
const host = `${API_SERVER_HOST}/api/cart`;

// 카트에 있는 제품 목록을 백엔드 조회
export const getCartItems = async () => {
  const res = await jwtAxios.get(`${host}/items`);

  return res.data;
};

// 카트에 있는 제품을 수정
export const postChangeCart = async (cartItem) => {
  const res = await jwtAxios.post(`${host}/change`, cartItem);

  return res.data;
};
