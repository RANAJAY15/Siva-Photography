import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadPhoto from './pages/UploadPhoto';
import ManagePhotos from './pages/ManagePhotos';
import ManageCategories from './pages/ManageCategories';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-content">
          <Routes>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/upload"      element={<UploadPhoto />} />
            <Route path="/photos"      element={<ManagePhotos />} />
            <Route path="/categories"  element={<ManageCategories />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13131f',
              color: '#f0ece4',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#c9a96e', secondary: '#0a0a10' } },
            error:   { iconTheme: { primary: '#e05252', secondary: '#0a0a10' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
