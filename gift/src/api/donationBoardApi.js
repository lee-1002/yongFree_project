import { API_SERVER_HOST } from "./todoApi";
import jwtAxios from "../util/jwtUtil";
import axios from "axios";

const prefix = `${API_SERVER_HOST}/api/donationBoard`;
//권한이 필요 없을 경우 axios로.

// export const getOne = async (tno) => {
//   const res = await jwtAxios.get(`${prefix}/${tno}`);
//   return res.data;
// };
export const getOne = async (tno) => {
  const res = await axios.get(`${prefix}/${tno}`);
  return res.data;
};

export const getList = async (pageParam) => {
  const { page, size } = pageParam;
  const res = await axios.get(`${prefix}/list`, {
    params: { page: page, size: size },
  });
  return res.data;
};

export const postAdd = async (DonationBoardObj) => {
  const res = await jwtAxios.post(`${prefix}/`, DonationBoardObj, {});
  return res.data;
};

export const deleteOne = async (tno) => {
  const res = await jwtAxios.delete(`${prefix}/${tno}`);
  return res.data;
};

export const putOne = async (donationBoard) => {
  const res = await jwtAxios.put(
    `${prefix}/${donationBoard.tno}`,
    donationBoard,
    {}
  );
  return res.data;
};
