import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

import AppBar from './components/AppBar/AppBar';
import Home from './pages/Home';
import AuthLayout from './pages/auth/Auth';
import LoginForm from './pages/auth/LoginForm';
import RegisterForm from './pages/auth/RegisterForm';
import VerifyEmail from './pages/auth/VerifyEmail';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected layout group (simplified for now) */}
        <Route path="/*" element={
          <>
            <AppBar />
            <main>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </main>
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
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
          }}
        />
      </Router>
    </Provider>
  );
}

export default App;
