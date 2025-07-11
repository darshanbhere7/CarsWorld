import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { io } from "socket.io-client";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://carsworld-backend.onrender.com";
export const socket = io(SOCKET_URL);
