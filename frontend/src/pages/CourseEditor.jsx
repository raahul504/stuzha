import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import ModuleList from '../components/admin/ModuleList';
import AddModule from '../components/admin/AddModule';

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const courseData = await adminService.getCourseById(id);
      setCourse(courseData.course);
      const modulesData = await adminService.getModules(id);
      setModules(modulesData.modules);
    } catch (err) {
      alert('Failed to load course');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => {
            const isInstructor = window.location.pathname.includes('/instructor/');
            navigate(isInstructor ? '/instructor' : '/admin');
          }} className="text-blue-600 hover:underline">
            ← Back to {window.location.pathname.includes('/instructor/') ? 'Instructor' : 'Admin'} Dashboard
          </button>
          <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ModuleList modules={modules} courseId={id} onUpdate={fetchCourse} />
          </div>
          <div>
            <AddModule courseId={id} onAdd={fetchCourse} />
          </div>
        </div>
      </div>
    </div>
  );
}