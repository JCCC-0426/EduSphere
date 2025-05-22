import { auth } from './api.js';

// 登录函数
export async function login(username, password) {
    try {
        const user = await auth.login(username, password);
        // 保存用户信息到localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
}

// 注册函数
export async function register(userData) {
    try {
        await auth.register(userData);
        // 注册成功后自动登录
        return await login(userData.username, userData.password);
    } catch (error) {
        console.error('注册失败:', error);
        throw error;
    }
}

// 登出函数
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

// 获取当前用户
export function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 检查用户是否已登录
export function isLoggedIn() {
    return !!getCurrentUser();
}

// 检查用户角色
export function checkRole(requiredRole) {
    const user = getCurrentUser();
    return user && user.role === requiredRole;
} 