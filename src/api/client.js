/**
 * Fetches available learning modules for students
 * @async
 * @returns {Promise<Object>} Response object containing:
 *   @returns {number} statusCode - HTTP status code (200 for success, 500 for error)
 *   @returns {Object} headers - Response headers with Content-Type
 *   @returns {Object} body - Response payload containing:
 *     @returns {Array<Object>} modules - Array of learning module objects with:
 *       @returns {string} title - Module title
 *       @returns {string} route - Module route path
 *       @returns {number} progress - Module completion percentage
 *       @returns {string} description - Module description
 * @throws {Error} When there is a server error
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('API_BASE_URL', API_BASE_URL);

/**
/**
 * Logs in a user using AWS Lambda endpoint
 * @param {Object} userData - User credentials object
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} The response object containing status and data
 */
export async function loginUser({ email, password }) {

  const response = await fetch(`${API_BASE_URL}/auth-user-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  return { status: response.status, data };
}

export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-user-sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();
    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };  
  }
};  

/**
 * Retrieves user data based on email and JWT token
 * @param {string} email - User email address
 * @param {string} jwtToken - JWT token for authentication
 * @returns {Promise<Object>} The response object containing status and data
 */
export async function getUserData(email, jwtToken) {
  const response = await fetch(`${API_BASE_URL}/get-user-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  return { status: response.status, data };
}


export const createCourse = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };  
  }
};


export const getModules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-modules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: response.headers,
      body: data
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};

export const getTeacherData = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-teacher-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return {
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      status: 500,
      error: error.message,
    };
  }
};

export const deleteCourse = async (email, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, courseId }),
    });

    const data = await response.json();
    return {
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      status: 500,
      error: error.message,
    };
  }
  };

export const createTopic = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    console.error('Error creating topic:', error);
    return {
      status: 500,
      error: error.message,
    };
  }
};

export const getTopics = async (email, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, courseId }),
    });
    const data = await response.json();
    return {
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching topics:', error);
    return {
      status: 500,
      error: error.message,
    };
  }
};


export const deleteTopic = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log('responseData', responseData);
    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    console.error('Error deleting topic:', error);
    return {
      status: 500,
      error: error.message,
    };
  }
};

export const getCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/get-courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const saveGameSession = async (data) => {
  const response = await fetch(`${API_BASE_URL}/save-game-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getGameAnalytics = async (email) => {
  const response = await fetch(`${API_BASE_URL}/get-game-analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return await response.json();
};

export const uploadSlide = async (data) => {
  const response = await fetch(`${API_BASE_URL}/upload-slide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getLearningMaterials = async (prefix) => {
  const response = await fetch(`${API_BASE_URL}/get-learning-materials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefix }),
  });
  return await response.json();
};