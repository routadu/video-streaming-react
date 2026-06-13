import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppBar from './components/organisms/AppBar/AppBar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Stream from './pages/Stream';
import Login from './pages/Login';
import Register from './pages/Register';
import UserPage from './pages/UserPage';
import { useAuth } from './context/AuthContext';
import Spinner from './components/atoms/Spinner/Spinner';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
      }}>
        <Spinner size="xl" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="app-layout">
        <AppBar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/stream/:videoId" element={<Stream />} />
            <Route path="/user/:username" element={<UserPage />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
