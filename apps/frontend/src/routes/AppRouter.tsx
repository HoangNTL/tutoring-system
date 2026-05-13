import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div>Home Page</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}