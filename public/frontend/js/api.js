// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

// API请求函数
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户相关API
export const auth = {
    login: (username, password) => 
        apiRequest('/login', 'POST', { username, password }),
    
    register: (userData) => 
        apiRequest('/register', 'POST', userData),
};

// 课程相关API
export const courses = {
    getAll: () => 
        apiRequest('/courses'),
    
    create: (courseData) => 
        apiRequest('/courses', 'POST', courseData),
    
    enroll: (courseId, studentId) => 
        apiRequest('/enroll', 'POST', { course_id: courseId, student_id: studentId }),
}; 