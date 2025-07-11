// src/utils/uploadImage.js
import ImageKit from "imagekit-javascript";
import axios from "axios";

// Initialize without auth info (we'll fetch it dynamically)
const imagekit = new ImageKit({
  publicKey: "public_1VxahNHphfKG6FN3fKdA2X0mkTI=", // ✅ from .env
  urlEndpoint: "https://ik.imagekit.io/darshanimage", // ✅ from .env
  authenticationEndpoint: "", // leave empty
});

const API_URL = import.meta.env.VITE_API_URL || "https://carsworld-backend.onrender.com";

export const uploadToImageKit = async (file) => {
  try {
    // 1. Get authentication parameters from backend
    const authRes = await axios.get(`${API_URL}/api/imagekit/auth`);
    const { token, signature, expire } = authRes.data;

    // 2. Use those parameters to upload image
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file,
          fileName: `car_${Date.now()}`,
          token,
          signature,
          expire,
        },
        (err, result) => {
          if (err) {
            console.error("ImageKit Upload Error:", err);
            reject(err);
          } else {
            resolve(result.url); // returns uploaded image URL
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to fetch ImageKit token:", error);
    throw error;
  }
};
