import axios from "axios";

export default async function fetch(url, method = 'get', headers = {}, body = null) {
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body, // Only include data if body is provided
      });
      return response.data; // Return the data from the response
    } catch (error) {
      throw error; // Re-throw the error for proper handling
    }
  }
  