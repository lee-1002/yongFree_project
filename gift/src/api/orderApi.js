import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";
export const createOrder = (req) =>
  axios.post(`${API_SERVER_HOST}/api/order`, req, { withCredentials: true });
