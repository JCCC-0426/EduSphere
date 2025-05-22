import { 
  getAllCourses,
  getUserEnrollments,
  addEnrollment,
  updateCourse,
  cancelStudentEnrollment
} from './storage.js';

// Global reference for enrollCourse
window.enrollCourse = async function(courseId) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const courses = await getAllCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (!course) {
            alert('Course not found!');
            return;
        }

        if (course.currentStudents >= course.maxStudents) {
            alert('Course is full!');
            return;
        }

        // Show enrollment confirmation
        const confirmEnroll = confirm(
            `Confirm Enrollment:\n\n` +
            `Course: ${course.title}\n` +
            `Teacher: ${course.teacher}\n\n` +
            `Do you want to proceed?`
        );
        
        if (confirmEnroll) {
            // Create enrollment
            const enrollment = {
                courseId: course.id.toString(),
                studentName: currentUser.username,
                enrollDate: new Date().toISOString()
            };

            // Add enrollment
            await addEnrollment(enrollment);
            
            // Update course student count
            await updateCourse(course.id, {
                currentStudents: course.currentStudents + 1
            });

            alert('Enrollment successful!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        alert('Failed to enroll. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check login status
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'student') {
            window.location.href = 'login.html';
            return;
        }

        // Setup search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            // Enter key search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchCourses();
                }
            });
            
            // Search button click
            if (searchBtn) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    searchCourses();
                });
            }
        }

        // Setup show all button
        const showAllBtn = document.getElementById('showAllBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                document.getElementById('searchInput').value = '';
                const courseElements = document.querySelectorAll('#courseList .col-md-4');
                courseElements.forEach(el => el.style.display = 'block');
            });
        }

        await loadCourses();
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Failed to load courses. Please try again.');
    }
});

async function loadCourses() {
    try {
        const courseList = document.getElementById('courseList');
        if (!courseList) return; // Skip if not on courses page

        const [courses, enrollments] = await Promise.all([
            getAllCourses(),
            getUserEnrollments(JSON.parse(sessionStorage.getItem('currentUser')).username)
        ]);

        courseList.innerHTML = '';

        courses.forEach(course => {
            // Only show active courses that aren't full
            if (course.status === 'active' && course.currentStudents < course.maxStudents) {
                const isEnrolled = enrollments.some(e => e.courseId === course.id.toString());

                const courseElement = document.createElement('div');
                courseElement.className = 'col-md-4 mb-4';
                courseElement.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${course.title}</h5>
                            <p class="card-text">${course.description}</p>
                            <div class="course-details">
                                <p><strong>Teacher:</strong> ${course.teacher}</p>
                                <p><strong>Category:</strong> ${course.category}</p>
                                ${course.time ? `<p><strong>Schedule:</strong> ${course.time}</p>` : ''}
                                <p><strong>Location:</strong> ${course.location}</p>
                                ${course.startDate ? `<p><strong>Dates:</strong> ${new Date(course.startDate).toLocaleDateString()} - ${new Date(course.endDate).toLocaleDateString()}</p>` : ''}
                                <p><strong>Enrollment:</strong> ${course.currentStudents}/${course.maxStudents}</p>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-primary" 
                                    onclick="enrollCourse('${course.id}')"
                                    ${isEnrolled ? 'disabled' : ''}>
                                    ${isEnrolled ? 'Enrolled' : 'Enroll Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                courseList.appendChild(courseElement);
            }
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        throw error;
    }
}

function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseElements = Array.from(document.querySelectorAll('#courseList .card'));
    
    // Score and filter courses
    const scoredCourses = courseElements.map(element => {
        const title = element.querySelector('.card-title').textContent.toLowerCase();
        const description = element.querySelector('.card-text').textContent.toLowerCase();
        const teacher = element.querySelector('.course-details p:nth-child(1)').textContent.toLowerCase();
        const category = element.querySelector('.course-details p:nth-child(2)').textContent.toLowerCase();
        const location = element.querySelector('.course-details p:nth-child(4)').textContent.toLowerCase();
        
        // Calculate match score (higher = better match)
        let score = 0;
        if (title.includes(searchTerm)) score += 5;
        if (teacher.includes(searchTerm)) score += 4;
        if (category.includes(searchTerm)) score += 3;
        if (description.includes(searchTerm)) score += 2;
        if (location.includes(searchTerm)) score += 1;
        
        return { element, score };
    }).filter(course => course.score > 0);

    // Sort by score (highest first)
    scoredCourses.sort((a, b) => b.score - a.score);

    // Only hide/show if there are matches
    if (scoredCourses.length > 0) {
        // Hide all courses first
        courseElements.forEach(el => el.parentElement.style.display = 'none');
        
        // Show matching courses in order of relevance
        scoredCourses.forEach(course => {
            course.element.parentElement.style.display = 'block';
        });
    } else {
        // No matches - show all courses
        courseElements.forEach(el => el.parentElement.style.display = 'block');
        document.getElementById('searchInput').value = '';
    }
}

function highlightMatches(element, searchTerm) {
    if (!searchTerm) return;
    
    const textNodes = [];
    const walker = document.createTreeWalker(
        element, 
        NodeFilter.SHOW_TEXT, 
        null, 
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(node => {
        const text = node.nodeValue;
        const regex = new RegExp(searchTerm, 'gi');
        const newText = text.replace(regex, match => 
            `<span class="bg-warning">${match}</span>`
        );
        
        if (newText !== text) {
            const span = document.createElement('span');
            span.innerHTML = newText;
            node.parentNode.replaceChild(span, node);
        }
    });
}

// Initialize My Courses page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if we're on the My Courses page
        if (window.location.pathname.includes('student-my-courses.html')) {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser || currentUser.role !== 'student') {
                window.location.href = 'login.html';
                return;
            }

            // Set username in navbar
            const usernameElement = document.getElementById('usernameDisplay');
            if (usernameElement) {
                usernameElement.textContent = currentUser.username;
            }

            await loadMyCourses(currentUser.username);
        }
    } catch (error) {
        console.error('My Courses initialization error:', error);
        alert('Failed to load my courses. Please try again.');
    }
});

async function loadMyCourses(studentUsername) {
    try {
        console.log('Loading courses for student:', studentUsername);
        const [enrollments, allCourses] = await Promise.all([
            getUserEnrollments(studentUsername),
            getAllCourses()
        ]);
        console.log('Student enrollments:', JSON.stringify(enrollments, null, 2));
        console.log('All courses:', JSON.stringify(allCourses, null, 2));

        // Filter enrolled courses with detailed logging
        const enrolledCourses = allCourses.filter(course => {
            const isEnrolled = enrollments.some(e => {
                // Handle both string and numeric IDs
                const courseIdStr = course.id.toString();
                const enrollmentCourseIdStr = e.courseId.toString();
                const match = enrollmentCourseIdStr === courseIdStr;
                console.log(`Checking enrollment: ${e.courseId} (${typeof e.courseId}) vs course: ${course.id} (${typeof course.id}) -> ${match}`);
                return match;
            });
            console.log(`Course ${course.id} (${course.title}) enrolled: ${isEnrolled}`);
            return isEnrolled;
        });
        console.log('Final enrolled courses:', JSON.stringify(enrolledCourses, null, 2));

        // Categorize courses by date
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const thisWeeksCourses = enrolledCourses.filter(course => {
            if (!course.startDate) return false;
            const startDate = new Date(course.startDate);
            console.log('Checking this week course:', course.title, 
                        'startDate:', startDate,
                        'now:', now,
                        'oneWeekFromNow:', oneWeekFromNow);
            return startDate >= now && startDate <= oneWeekFromNow;
        });

        const upcomingCourses = enrolledCourses.filter(course => {
            if (!course.startDate) return false;
            const startDate = new Date(course.startDate);
            console.log('Checking upcoming course:', course.title,
                        'startDate:', startDate,
                        'oneWeekFromNow:', oneWeekFromNow);
            return startDate > oneWeekFromNow;
        });

        // Update stats and UI with accurate counts
        console.log('Updating counts:', {
            enrolled: enrolledCourses.length,
            thisWeek: thisWeeksCourses.length,
            upcoming: upcomingCourses.length
        });
        document.querySelector('.bg-primary .display-4').textContent = enrolledCourses.length;
        document.getElementById('enrollmentCount').textContent = enrolledCourses.length;
        document.getElementById('thisWeekCount').textContent = thisWeeksCourses.length;
        document.getElementById('upcomingCount').textContent = upcomingCourses.length;
        
        // Show/hide empty state
        const noCoursesAlert = document.getElementById('noCoursesAlert');
        if (enrolledCourses.length === 0) {
            noCoursesAlert.style.display = 'block';
        } else {
            noCoursesAlert.style.display = 'none';
        }
        
        // Load course list
        const courseList = document.getElementById('enrolledCoursesList');
        if (!courseList) {
            console.error('Course list element not found');
            return;
        }
        courseList.innerHTML = '';

        enrolledCourses.forEach(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-4';
            col.innerHTML = `
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">${course.title}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${course.description}</p>
                        <div class="mb-3">
                            <p><strong>Teacher:</strong> ${course.teacher}</p>
                            <p><strong>Schedule:</strong> ${course.time}</p>
                            <p><strong>Location:</strong> ${course.location}</p>
                            <p><strong>Enrolled On:</strong> ${new Date(enrollment.enrollDate).toLocaleDateString()}</p>
                        </div>
                        <div class="progress mb-3" style="height: 20px">
                            <div class="progress-bar" 
                                role="progressbar" 
                                style="width: ${(course.currentStudents/course.maxStudents)*100}%">
                                ${course.currentStudents}/${course.maxStudents} students
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-danger w-100" 
                            onclick="cancelEnrollment('${course.id}')">
                            <i class="bi bi-trash"></i> Cancel Enrollment
                        </button>
                    </div>
                </div>
            `;
            courseList.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading my courses:', error);
        throw error;
    }
}

// Make cancelEnrollment globally available
window.cancelEnrollment = async function(courseId) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (confirm('Are you sure you want to cancel this enrollment?')) {
            await cancelStudentEnrollment(currentUser.username, courseId);
            
            // Update course student count
            const courses = await getAllCourses();
            const course = courses.find(c => c.id === courseId);
            if (course) {
                await updateCourse(courseId, {
                    currentStudents: course.currentStudents - 1
                });
            }

            alert('Enrollment cancelled successfully');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error cancelling enrollment:', error);
        alert('Failed to cancel enrollment. Please try again.');
    }
}
