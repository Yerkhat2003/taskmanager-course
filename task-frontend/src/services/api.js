const API_BASE_URL = 'http://localhost:7777';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка запроса' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getBoards() {
    return this.request('/boards');
  }

  async getBoard(id) {
    return this.request(`/boards/${id}`);
  }

  async createBoard(data) {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();
