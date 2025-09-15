import axios from "axios";

export default axios.create({
  baseURL: "https://drf-blog-ink.vercel.app/api/v1",
  //baseURL: "http://127.0.0.1:8000/api/v1",
});

// my drf app on vercel: https://drf-blog-ink.vercel.app/api/v1/
