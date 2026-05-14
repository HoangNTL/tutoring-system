import { Routes, Route } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <HomePage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
