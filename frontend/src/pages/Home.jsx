import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dcs-black">
        <Navbar />
        <section className="pt-32 pb-24 px-8" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0a2e 100%)', height:"100vh" }}>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div>
              <h1 className="text-5xl mt-10 mb-6" style={{ background: 'linear-gradient(135deg, #FFFFFF, #9D50BB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome to <span className="text-dcs-purple">LMS Platform</span>
              </h1>
              <p className="text-lg text-dcs-text-gray mb-10">
                Transform your career with our comprehensive learning management system. 
                Access expert-led courses and advance your skills.
              </p>
              <div className="mb-20">
                <button
                  onClick={() => navigate('/courses')}
                  className="btn-purple"
                >
                  Start Learning Today
                </button>
              </div>
              <div className="flex gap-12">
                <div>
                  <h2 className="text-3xl text-dcs-purple mb-2">100+</h2>
                  <p className="text-dcs-text-gray">Courses Available</p>
                </div>
                <div>
                  <h2 className="text-3xl text-dcs-purple mb-2">24/7</h2>
                  <p className="text-dcs-text-gray">Access Anytime</p>
                </div>
                <div>
                  <h2 className="text-3xl text-dcs-purple mb-2">Expert</h2>
                  <p className="text-dcs-text-gray">Instructors</p>
                </div>
              </div>
            </div>
            <div className="card animate-float mt-10 bg-gradient-to-r from-dcs-dark-purple to-dcs-electric-indigo text-white shadow-lg" >
              <h3 className="text-white mb-6 text-xl font-bold">Platform Highlights</h3>
              <ul className="list-none text-white leading-8 space-y-2 font-semibold">
                <li>✓ Comprehensive Course Library</li>
                <li>✓ Expert Instructors</li>
                <li>✓ Interactive Learning Experience</li>
                <li>✓ Progress Tracking</li>
                <li>✓ Certificates on Completion</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto" style={{ padding: '5rem 2rem' }}>
          <h2 className="section-title">
            Why Choose <span className="purple-text">Our Platform?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-dcs-purple mb-4 text-xl">🎓 Expert Faculty</h3>
              <p className="text-dcs-text-gray">
                Learn from industry veterans and professionals with real-world expertise.
              </p>
            </div>
            <div className="card">
              <h3 className="text-dcs-purple mb-4 text-xl">💼 Career Support</h3>
              <p className="text-dcs-text-gray">
                Comprehensive career guidance and resources to help you succeed.
              </p>
            </div>
            <div className="card">
              <h3 className="text-dcs-purple mb-4 text-xl">🔧 Hands-on Training</h3>
              <p className="text-dcs-text-gray">
                Over 50% experiential learning with real-world projects and exercises.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dcs-black">
      <Navbar />
      <section className="pt-32 pb-24 px-8" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0a2e 100%)', height:"100vh" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <h1 className="text-5xl mt-10 mb-6 leading-normal" style={{ background: 'linear-gradient(135deg, #FFFFFF, #9D50BB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome back, <span className="text-dcs-purple">{user?.firstName}</span>
            </h1>
            <p className="text-lg text-dcs-text-gray mb-20">
              Continue your learning journey. Explore new courses and track your progress.
            </p>
            <div className="mb-10">
              <button
                onClick={() => navigate('/courses')}
                className="btn-purple"
              >
                Browse Courses
              </button>
            </div>
            <div className="flex gap-12">
              <div>
                <h2 className="text-3xl text-dcs-purple mb-2">100+</h2>
                <p className="text-dcs-text-gray">Courses Available</p>
              </div>
              <div>
                <h2 className="text-3xl text-dcs-purple mb-2">24/7</h2>
                <p className="text-dcs-text-gray">Access Anytime</p>
              </div>
              <div>
                <h2 className="text-3xl text-dcs-purple mb-2">Expert</h2>
                <p className="text-dcs-text-gray">Instructors</p>
              </div>
            </div>
          </div>
          <div className="card animate-float mt-10 bg-gradient-to-r from-dcs-dark-purple to-dcs-electric-indigo text-white shadow-lg">
            <h3 className="text-white mb-6 text-xl font-semibold">Quick Actions</h3>
            <ul className="list-none text-gray leading-8 space-y-2">
              <li>✓ View My Courses</li>
              <li>✓ Browse Catalog</li>
              <li>✓ Track Progress</li>
              <li>✓ Update Profile</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto" style={{ background: '#121212', padding: '5rem 2rem' }}>
        <h2 className="section-title">
          Your <span className="purple-text">Learning Path</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-dcs-black">
            <h3 className="text-dcs-purple mb-4 text-xl">📚 My Courses</h3>
            <p className="text-dcs-text-gray mb-4">
              Continue learning from your enrolled courses.
            </p>
            <button
              onClick={() => navigate('/my-courses')}
              className="text-dcs-purple hover:text-dcs-electric-indigo transition-colors font-semibold"
            >
              View My Courses →
            </button>
          </div>
          <div className="card bg-dcs-black">
            <h3 className="text-dcs-purple mb-4 text-xl">🔍 Explore</h3>
            <p className="text-dcs-text-gray mb-4">
              Discover new courses and expand your skills.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="text-dcs-purple hover:text-dcs-electric-indigo transition-colors font-semibold"
            >
              Browse All Courses →
            </button>
          </div>
          <div className="card bg-dcs-black">
            <h3 className="text-dcs-purple mb-4 text-xl">👤 Profile</h3>
            <p className="text-dcs-text-gray mb-4">
              Manage your account and preferences.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="text-dcs-purple hover:text-dcs-electric-indigo transition-colors font-semibold"
            >
              View Profile →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}