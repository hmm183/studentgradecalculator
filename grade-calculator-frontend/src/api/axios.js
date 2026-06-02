import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://grade-calculator-pjm2.onrender.com" : "http://localhost:5000");
const instance = axios.create({
  baseURL: `${apiBaseURL}/api`
});
// 
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
