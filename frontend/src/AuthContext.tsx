'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from './services/authServices';
import { User } from './types/auth';

interface AuthContextType {
    user: User | null;
    access_token: string | null;
    setToken: (access_token: string | null) => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [access_token, setToken] = useState<string | null>(() => {
        // Chỉ lấy token nếu đang chạy trên client
        if (typeof window !== 'undefined') {
            return document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1] || null;
        }
        return null;
    });

    useEffect(() => {
        if (access_token) {
            // Lưu token vào cookie
            document.cookie = `token=${access_token}; path=/; max-age=3600; secure; SameSite=Strict`;
            // Fetch user profile khi có token
            getProfile()
                .then((profile) => setUser(profile))
                .catch(() => {
                    setToken(null);
                    document.cookie = 'token=; Max-Age=0; path=/'; // Xóa cookie nếu lỗi
                });
        } else {
            document.cookie = 'token=; Max-Age=0; path=/'; // Xóa cookie nếu không có token
            setUser(null);
        }
    }, [access_token]); // Chạy khi access_token thay đổi

    return (
        <AuthContext.Provider value={{ user, access_token, setToken, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};