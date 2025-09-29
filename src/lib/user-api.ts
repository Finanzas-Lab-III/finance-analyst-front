import { NavBarData } from "@/types/profile";
import axios from "axios";

const instance = axios.create({
  // Use same-origin requests so Next.js rewrites proxy to the backend and avoid CORS
  baseURL: "",
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

export const getProfile = async (): Promise<NavBarData | null> => {
  try {
    const response = await instance.get<NavBarData>("/api/user/me");
    return response.data;
  } catch (error) {
    return null;
  }
};
