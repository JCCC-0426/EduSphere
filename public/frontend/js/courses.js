import { courses } from './api.js';
import { getCurrentUser } from './auth.js';

// 获取所有课程
export async function getAllCourses() {
    try {
        return await courses.getAll();
    } catch (error) {
        console.error('获取课程列表失败:', error);
        throw error;
    }
}

// 创建新课程
export async function createCourse(courseData) {
    try {
        const user = getCurrentUser();
        if (!user || user.role !== 'teacher') {
            throw new Error('只有教师可以创建课程');
        }
        
        const course = {
            ...courseData,
            teacher_id: user.id
        };
        
        return await courses.create(course);
    } catch (error) {
        console.error('创建课程失败:', error);
        throw error;
    }
}

// 报名课程
export async function enrollCourse(courseId) {
    try {
        const user = getCurrentUser();
        if (!user || user.role !== 'student') {
            throw new Error('只有学生可以报名课程');
        }
        
        return await courses.enroll(courseId, user.id);
    } catch (error) {
        console.error('报名课程失败:', error);
        throw error;
    }
}

// 渲染课程列表
export function renderCourses(coursesList, container) {
    const containerElement = document.querySelector(container);
    if (!containerElement) return;

    containerElement.innerHTML = coursesList.map(course => `
        <div class="course-card">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="course-info">
                <span>类别: ${course.category}</span>
                <span>已报名: ${course.current_students}/${course.max_students}</span>
            </div>
            <button onclick="enrollCourse(${course.id})" 
                    ${course.current_students >= course.max_students ? 'disabled' : ''}>
                ${course.current_students >= course.max_students ? '已满' : '报名'}
            </button>
        </div>
    `).join('');
} 