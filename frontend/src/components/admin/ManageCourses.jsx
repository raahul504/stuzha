import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../api/adminService';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminService.getAllCourses();
      setCourses(data.courses);
    } catch (err) {
      console.error('Failed to load courses');
    }
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/course/${courseId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Courses</h2>
      
      {courses.length === 0 ? (
        <p className="text-gray-600">No courses created yet.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.shortDescription}</p>
                <span className={`text-xs px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <button
                onClick={() => handleEdit(course.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}