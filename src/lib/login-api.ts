import axios from "axios";

const calendarInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_URL || '',
  withCredentials: true,
});


export const authorize = async () => {
  return await axios.get('/api/session', { withCredentials: true });
}
