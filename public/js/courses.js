// Load courses
function loadCourses() {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach(course => {
        if (course.status === 'active') {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-md-4 mb-4';
            courseElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <p>Teacher: ${course.teacher}</p>
                        <p>Category: <span class="badge bg-info">${course.category}</span></p>
                        <p>Enrolled: ${course.currentStudents}/${course.maxStudents}</p>
                        <button class="btn btn-primary" onclick="enrollCourse(${course.id})">Enroll Now</button>
                    </div>
                </div>
            `;
            courseList.appendChild(courseElement);
        }
    });
}

// Search courses
function searchCourses() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach(course => {
        if (course.status === 'active' && 
            (course.title.toLowerCase().includes(searchTerm) || 
             course.description.toLowerCase().includes(searchTerm))) {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-md-4 mb-4';
            courseElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <p>Teacher: ${course.teacher}</p>
                        <p>Category: <span class="badge bg-info">${course.category}</span></p>
                        <p>Enrolled: ${course.currentStudents}/${course.maxStudents}</p>
                        <button class="btn btn-primary" onclick="enrollCourse(${course.id})">Enroll Now</button>
                    </div>
                </div>
            `;
            courseList.appendChild(courseElement);
        }
    });
}

// Filter courses by category
function filterCourses(category) {
    // Update button states
    const buttons = document.querySelectorAll('.btn-group .btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach(course => {
        if (course.status === 'active' && (category === 'all' || course.category === category)) {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-md-4 mb-4';
            courseElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <p>Teacher: ${course.teacher}</p>
                        <p>Category: <span class="badge bg-info">${course.category}</span></p>
                        <p>Enrolled: ${course.currentStudents}/${course.maxStudents}</p>
                        <button class="btn btn-primary" onclick="enrollCourse(${course.id})">Enroll Now</button>
                    </div>
                </div>
            `;
            courseList.appendChild(courseElement);
        }
    });
}

// Enroll in a course
function enrollCourse(courseId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        alert('Please login as a student first!');
        window.location.href = 'login.html';
        return;
    }

    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
        alert('Course not found!');
        return;
    }

    if (course.currentStudents >= course.maxStudents) {
        alert('Course is full!');
        return;
    }

    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const alreadyEnrolled = enrollments.some(e => 
        e.courseId === courseId && e.studentName === currentUser.username
    );

    if (alreadyEnrolled) {
        alert('You are already enrolled in this course!');
        return;
    }

    // Add enrollment record
    enrollments.push({
        courseId: courseId,
        studentName: currentUser.username,
        enrollDate: new Date().toISOString().split('T')[0]
    });

    // Update course current students
    course.currentStudents++;

    // Save updates
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
    localStorage.setItem('courses', JSON.stringify(courses));

    alert('Enrollment successful!');
    loadCourses();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Ensure storage is initialized
    if (typeof initializeStorage === 'function') {
        console.log('Initializing local storage...');
        initializeStorage();
        console.log('Local storage initialization completed');
    }
    
    // Load courses
    loadCourses();
}); 