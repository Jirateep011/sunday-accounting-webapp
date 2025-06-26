import axios from 'axios';

const API_URL = 'http://localhost:5000/api/pockets';

class PocketService {
  static async getAllPockets() {
    try {
      const response = await axios.get(API_URL);
      if (!response.data || response.data.length === 0) {
        console.warn('No pockets found, default pockets will be created');
      }
      return response.data;
    } catch (error) {
      console.error('Error in getAllPockets:', error);
      throw new Error(error.response?.data?.error || 'ไม่สามารถโหลดหมวดหมู่ได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  static async createPocket(pocketData) {
    try {
      const response = await axios.post(API_URL, pocketData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create pocket');
    }
  }

  static async updatePocket(id, pocketData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, pocketData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update pocket');
    }
  }

  static async deletePocket(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete pocket');
    }
  }

  static async getPocketsByEmail(email) {
    try {
      const response = await axios.get(`${API_URL}?email=${email}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch pockets by email');
    }
  }
}

export default PocketService;
