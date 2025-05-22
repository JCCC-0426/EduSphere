import { 
  addCourseToFirestore,
  getTeacherCourses,
  getEnrollmentsForTeacher,
  deleteCourseFromFirestore,
  logout
} from './storage.js';

// Make logout globally available
window.logout = logout;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded');
    
    try {
        // Check if user is logged in as teacher
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'teacher') {
            window.location.href = 'login.html';
            return;
        }

        // Set teacher name
        const teacherNameElement = document.getElementById('teacherName');
        if (teacherNameElement) {
            teacherNameElement.textContent = currentUser.username;
        }
        
        // Load dashboard data if on dashboard page
        const courseList = document.getElementById('courseList');
        if (courseList) {
            await loadDashboard(currentUser.username);
        }
        
        // Add form submit handler if on add course page
        const addCourseForm = document.getElementById('addCourseForm');
        if (addCourseForm) {
            addCourseForm.addEventListener('submit', addCourse);
        }

        // Add logout handler
        const logoutLink = document.querySelector('a[id="logoutLink"]');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Failed to load dashboard. Please try again.');
    }
});

// Add course
async function addCourse(event) {
    event.preventDefault();
    
    try {
        // Get form data
        const courseName = document.getElementById('courseName').value;
        const courseDescription = document.getElementById('courseDescription').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const courseTime = document.getElementById('courseTime').value;
        const courseLocation = document.getElementById('courseLocation').value;
        const courseCapacity = parseInt(document.getElementById('courseCapacity').value);
        const courseCategory = document.getElementById('courseCategory').value;
        
        // Get current user
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // Create new course
        const newCourse = {
            title: courseName,
            teacher: currentUser.username,
            description: courseDescription,
            startDate: startDate,
            endDate: endDate,
            time: courseTime,
            location: courseLocation,
            maxStudents: courseCapacity,
            currentStudents: 0,
            status: 'active',
            category: courseCategory,
            createdAt: new Date().toISOString()
        };
        
        // Add to Firestore
        await addCourseToFirestore(newCourse);
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher.html';
    } catch (error) {
        console.error('Error adding course:', error);
        alert('Failed to add course. Please try again.');
    }
}

// Load dashboard data
async function loadDashboard(teacherUsername) {
    try {
        const [courses, enrollments] = await Promise.all([
            getTeacherCourses(teacherUsername),
            getEnrollmentsForTeacher(teacherUsername)
        ]);

        // Update stats
        document.getElementById('totalCourses').textContent = courses.length;
        document.getElementById('activeCourses').textContent = 
            courses.filter(c => c.status === 'active').length;
        
        // Count unique students
        const uniqueStudents = new Set(
            enrollments.map(e => e.studentName)
        );
        document.getElementById('totalStudents').textContent = uniqueStudents.size;
        
        // Load course list
        loadCourseList(courses);
        
        // Load recent enrollments
        loadRecentEnrollments(courses, enrollments);
    } catch (error) {
        console.error('Dashboard load error:', error);
        alert('Failed to load dashboard data. Please try again.');
    }
}

// Load course list
function loadCourseList(courses) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.title}</td>
            <td>${course.category}</td>
            <td>${course.currentStudents}/${course.maxStudents}</td>
            <td><span class="badge bg-${course.status === 'active' ? 'success' : 'secondary'}">${course.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCourse('${course.id}')">Detail</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.id}')">Delete</button>
            </td>
        `;
        courseList.appendChild(row);
    });
}

// Load recent enrollments
function loadRecentEnrollments(courses, enrollments) {
    const enrollmentList = document.getElementById('enrollmentList');
    enrollmentList.innerHTML = '';

    // Get recent enrollments (already filtered and sorted)
    const recentEnrollments = enrollments
        .slice(0, 5); // Show only 5 most recent

    recentEnrollments.forEach(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        if (course) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${enrollment.studentName}</td>
                <td>${enrollment.studentEmail}</td>
                <td>${course.title}</td>
                <td>${new Date(enrollment.enrollDate).toLocaleDateString()}</td>
            `;
            enrollmentList.appendChild(row);
        }
    });
}

// Edit course - show details in modal
function editCourse(courseId) {
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Get the course details
    getTeacherCourses(currentUser.username).then(courses => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            // Create and show modal with course details
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'courseDetailsModal';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${course.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Description:</strong> ${course.description}</p>
                                    <p><strong>Teacher:</strong> ${course.teacher}</p>
                                    ${course.startDate ? `
                                    <div class="date-highlight mb-3">
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="bi bi-calendar-week text-info me-2"></i>
                                            <h6 class="mb-0">Course Dates</h6>
                                        </div>
                                        <div class="date-badge bg-info text-white px-3 py-2 rounded">
                                            ${new Date(course.startDate).toLocaleDateString()} - ${new Date(course.endDate).toLocaleDateString()}
                                        </div>
                                    </div>` : ''}
                                </div>
                                <div class="col-md-6">
                                    ${course.time ? `
                                    <div class="time-highlight mb-3">
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="bi bi-clock-fill text-primary me-2"></i>
                                            <h6 class="mb-0">Class Time</h6>
                                        </div>
                                        <div class="time-badge bg-primary text-white px-3 py-2 rounded">
                                            ${course.time}
                                        </div>
                                    </div>` : ''}
                                    ${course.location ? `
                                    <div class="location-highlight mb-3">
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="bi bi-geo-alt-fill text-success me-2"></i>
                                            <h6 class="mb-0">Location</h6>
                                        </div>
                                        <div class="location-badge bg-success text-white px-3 py-2 rounded">
                                            ${course.location}
                                        </div>
                                    </div>` : ''}
                                    <p><strong>Capacity:</strong> ${course.currentStudents}/${course.maxStudents}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            // Remove modal when hidden
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        }
    });
}

// Make functions globally available
window.editCourse = editCourse;
window.deleteCourse = async function(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            await deleteCourseFromFirestore(courseId);
            // Reload dashboard to reflect changes
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            await loadDashboard(currentUser.username);
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course. Please try again.');
        }
    }
}
