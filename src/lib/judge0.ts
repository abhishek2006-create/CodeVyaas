import axios from "axios";

const judge0 = axios.create({
  baseURL: process.env.JUDGE0_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default judge0;