import { NavBarData } from "@/types/profile";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_URL || "",
  withCredentials: true,
});

export const getProfile = async (): Promise<NavBarData | null> => {
  try {
    const response = await instance.get<NavBarData>("/api/user/me");
    return response.data;
  } catch (error) {
    return null;
  }
};
