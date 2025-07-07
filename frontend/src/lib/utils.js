import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { io } from "socket.io-client";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const socket = io("http://localhost:5000"); // Adjust URL for production
