import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5174/api/drawings",
});

// Save Drawing
export const saveDrawing = async (drawing) => {
  return await API.post("/save-drawing", drawing);
};

// Get All Drawings
export const getDrawings = async () => {
  return await API.get("/");
};

// Delete Drawing
export const deleteDrawing = async (id) => {
  return await API.delete(`/${id}`);
};