import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, type RootState } from './store/store';
import { setCredentials, logout } from './store/userSlice';
import { authApi } from './api/auth.api';
import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';

import AppBar from './components/AppBar/AppBar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import AuthLayout from './pages/auth/Auth';
import LoginForm from './pages/auth/LoginForm';
import RegisterForm from './pages/auth/RegisterForm';
import VerifyEmail from './pages/auth/VerifyEmail';
import Profile from './pages/Profile/Profile';
import FindInstructors from './pages/FindInstructors/FindInstructors';
import InstructorDetails from './pages/InstructorDetails/InstructorDetails';
import MyMatches from './pages/MyMatches/MyMatches';
import ChatPage from './pages/Chat/ChatPage';
import SchedulePage from './pages/Schedule/SchedulePage';

import CourseList from './pages/Courses/CourseList';
import CourseDetails from './pages/Courses/CourseDetails';
import MyCourses from './pages/Courses/MyCourses';
import CreateCourse from './pages/Courses/CreateCourse';

import AdminDashboard from './pages/Admin/AdminDashboard';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from '@shared/index';
import Unauthorized from './pages/Unauthorized';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isRestoring, setIsRestoring] = useState(true);

  // Initialize theme detector so root document gets correct classes on load
  useTheme();

  useEffect(() => {
    const restoreSession = async () => {
      if (isAuthenticated) {
        setIsRestoring(false);
        return;
      }

      try {
        const res = await authApi.refreshToken();
        if (res.success) {
          dispatch(setCredentials({ user: res.data.user, token: res.data.accessToken }));
          setIsRestoring(false);
          return;
        }
      } catch (err) {
        // It's expected to fail if user hasn't logged in recently (cookie expired or missing)
      }

      dispatch(logout());
      setIsRestoring(false);
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected layout group (simplified for now) */}
        <Route path="/*" element={
          <>
            <AppBar />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/instructors" element={<FindInstructors />} />
                  <Route path="/instructors/:id" element={<InstructorDetails />} />
                  <Route path="/matches" element={<MyMatches />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />

                  <Route path="/courses" element={<CourseList />} />
                  <Route path="/courses/:id" element={<CourseDetails />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* We just check INSTRUCTOR manually inside components, or rely on lack of API access for now */}
                {/* For real protection, we would use a ProtectedRoute abstraction */}
                <Route path="/my-courses" element={
                  <ProtectedRoute allowedRole={UserRole.INSTRUCTOR}>
                    <MyCourses />
                  </ProtectedRoute>

                }
                />
                <Route path="/courses/create" element={
                  <ProtectedRoute allowedRole={UserRole.INSTRUCTOR}>
                    <CreateCourse />
                  </ProtectedRoute>

                }
                />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRole={UserRole.ADMIN}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
                />


                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
          }}
        />
      </Router>
    </Provider>
  );
}

export default App;
