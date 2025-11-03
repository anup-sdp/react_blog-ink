// src/services/auth-api-client.js:
import axios from "axios";

const authApiClient = axios.create({
  baseURL: "https://drf-blog-ink.vercel.app/api/v1", // my deployed drf app
  //baseURL: "http://127.0.0.1:8000/api/v1",
});

export default authApiClient;

authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authTokens");
    if (token) {
		//console.log("in auth-api-client.js, token =", token);
      config.headers.Authorization = `Bearer ${JSON.parse(token).access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// can also use a Response interceptor to handle token refresh on 401 errors