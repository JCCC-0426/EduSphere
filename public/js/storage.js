/** 
 * Firestore Database Utility Class
 * For handling course reservation system data storage
 */

import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "/js/firebase-config.js";

// Collections
const USERS_COLLECTION = "users";
const COURSES_COLLECTION = "courses";
const ENROLLMENTS_COLLECTION = "enrollments";

// Initialize Firestore with test data
async function initializeStorage() {
  // Check if already initialized
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
  if (!usersSnapshot.empty) {
    return;
  }

  // Add test users
  const users = [
    { username: 'teacher1', password: '123456', role: 'teacher', email: 'teacher1@example.com' },
    { username: 'student1', password: '123456', role: 'student', email: 'student1@example.com' }
  ];
  
  for (const user of users) {
    await setDoc(doc(db, USERS_COLLECTION, user.username), user);
  }

  // Add test courses
  const courses = [
    {
      id: 1,
      title: 'Python Basics',
      teacher: 'teacher1',
      description: 'Python programming course for beginners',
      maxStudents: 20,
      currentStudents: 5,
      status: 'active',
      category: 'Computer Science',
      location: 'Computer Lab 3',
      schedule: 'Mon/Wed 10:00-12:00',
      startDate: '2024-06-01',
      endDate: '2024-08-30'
    },
    {
      id: 2,
      title: 'Web Development',
      teacher: 'teacher1',
      description: 'Web development using HTML, CSS and JavaScript',
      maxStudents: 15,
      currentStudents: 8,
      status: 'active',
      category: 'Computer Science'
    },
    {
      id: 3,
      title: 'Sketching Basics',
      teacher: 'teacher1',
      description: 'Learn basic sketching techniques and principles',
      maxStudents: 12,
      currentStudents: 3,
      status: 'active',
      category: 'Art'
    },
    {
      id: 4,
      title: 'Watercolor Painting',
      teacher: 'teacher1',
      description: 'Master basic watercolor painting techniques',
      maxStudents: 10,
      currentStudents: 2,
      status: 'active',
      category: 'Art'
    },
    {
      id: 5,
      title: 'English Speaking Practice',
      teacher: 'teacher1',
      description: 'Improve English speaking and listening skills',
      maxStudents: 15,
      currentStudents: 6,
      status: 'active',
      category: 'Language'
    }
  ];

  for (const course of courses) {
    await setDoc(doc(db, COURSES_COLLECTION, course.id.toString()), course);
  }

  // Add test enrollments
  const enrollments = [
    {
      id: 1,
      courseId: 1,
      studentName: 'student1',
      enrollDate: '2024-03-20'
    }
  ];

  for (const enrollment of enrollments) {
    await setDoc(doc(db, ENROLLMENTS_COLLECTION, enrollment.id.toString()), enrollment);
  }

  console.log('Firestore test data initialization completed');
}

// Get all users
async function getAllUsers() {
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
  return usersSnapshot.docs.map(doc => doc.data());
}

// Get all courses
async function getAllCourses() {
  const coursesSnapshot = await getDocs(collection(db, COURSES_COLLECTION));
  return coursesSnapshot.docs.map(doc => doc.data());
}

// Get all enrollments
async function getAllEnrollments() {
  const enrollmentsSnapshot = await getDocs(collection(db, ENROLLMENTS_COLLECTION));
  return enrollmentsSnapshot.docs.map(doc => doc.data());
}

// Add a new user
async function addUser(user) {
  await setDoc(doc(db, USERS_COLLECTION, user.username), user);
}

// Add a new course
async function addCourse(course) {
  await setDoc(doc(db, COURSES_COLLECTION, course.id.toString()), course);
}

// Update a course
async function updateCourse(courseId, updatedCourse) {
  await updateDoc(doc(db, COURSES_COLLECTION, courseId.toString()), updatedCourse);
}

// Delete a course
async function deleteCourse(courseId) {
  await deleteDoc(doc(db, COURSES_COLLECTION, courseId.toString()));
}

// Add a new enrollment
async function addEnrollment(enrollment) {
  try {
    const enrollmentRef = doc(collection(db, ENROLLMENTS_COLLECTION));
    await setDoc(enrollmentRef, {
      ...enrollment,
      id: enrollmentRef.id,
      courseId: enrollment.courseId.toString()
    });
    return enrollmentRef.id;
  } catch (error) {
    console.error("Error adding enrollment: ", error);
    throw error;
  }
}

// Get user enrollments
async function getUserEnrollments(username) {
  try {
    console.log(`Querying enrollments for student: ${username}`);
    const q = query(collection(db, ENROLLMENTS_COLLECTION), where("studentName", "==", username));
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} enrollments for ${username}`);
    querySnapshot.forEach(doc => {
      console.log(`Enrollment: ${JSON.stringify(doc.data(), null, 2)}`);
    });
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting enrollments:', error);
    return [];
  }
}

// Add new course to Firestore
async function addCourseToFirestore(course) {
  const courseRef = doc(collection(db, COURSES_COLLECTION));
  await setDoc(courseRef, {
    ...course,
    id: courseRef.id
  });
  return courseRef.id;
}

// Get teacher courses
async function getTeacherCourses(teacherUsername) {
  const q = query(collection(db, COURSES_COLLECTION), where("teacher", "==", teacherUsername));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Get enrollments for teacher's courses
async function getEnrollmentsForTeacher(teacherUsername) {
  // First get teacher's course IDs
  const courses = await getTeacherCourses(teacherUsername);
  const courseIds = courses.map(c => c.id);
  
  // Then get enrollments for these courses
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where("courseId", "in", courseIds)
  );
  const querySnapshot = await getDocs(q);
  const enrollments = querySnapshot.docs.map(doc => doc.data());
  
  // Get all users to map usernames to emails
  const users = await getAllUsers();
  const userMap = new Map(users.map(u => [u.username, u]));
  
  // Enrich enrollments with student email
  return enrollments.map(e => ({
    ...e,
    studentEmail: userMap.get(e.studentName)?.email || ''
  }));
}

// Delete course from Firestore
async function deleteCourseFromFirestore(courseId) {
  await deleteDoc(doc(db, COURSES_COLLECTION, courseId));
  
  // Also delete any enrollments for this course
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where("courseId", "==", courseId)
  );
  const querySnapshot = await getDocs(q);
  
  const deletePromises = querySnapshot.docs.map(doc => 
    deleteDoc(doc.ref)
  );
  
  await Promise.all(deletePromises);
}

// Initialize Firestore when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Firestore...');
  initializeStorage().then(() => {
    console.log('Firestore initialization completed');
    return getAllUsers();
  }).then(users => {
    console.log('Current users in Firestore:', users);
  }).catch(error => {
    console.error('Firestore initialization error:', error);
  });
});

// Get student enrollments with course details
async function getStudentEnrollments(username) {
  const enrollments = await getUserEnrollments(username);
  const courses = await getAllCourses();
  
  return enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return {
      ...course,
      enrollmentDate: enrollment.enrollDate
    };
  });
}

// Cancel student enrollment
async function cancelStudentEnrollment(username, courseId) {
  // Find the enrollment to delete
  const q = query(
    collection(db, ENROLLMENTS_COLLECTION),
    where("studentName", "==", username),
    where("courseId", "==", courseId)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Delete the enrollment
    await deleteDoc(querySnapshot.docs[0].ref);
    
    // Decrement course student count
    const courseRef = doc(db, COURSES_COLLECTION, courseId.toString());
    await updateDoc(courseRef, {
      currentStudents: increment(-1)
    });
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

export {
  initializeStorage,
  getAllUsers,
  getAllCourses,
  getAllEnrollments,
  addUser,
  addCourse,
  updateCourse,
  deleteCourse,
  addEnrollment,
  getUserEnrollments,
  getTeacherCourses,
  getStudentEnrollments,
  cancelStudentEnrollment,
  addCourseToFirestore,
  getEnrollmentsForTeacher,
  deleteCourseFromFirestore,
  logout
};
