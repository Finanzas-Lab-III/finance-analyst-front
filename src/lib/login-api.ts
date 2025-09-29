import axios from "axios";

const instance = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

export const authorize = async () => {
  return await axios.get('/api/session', { withCredentials: true });
} // TODO: this could be better
