"use client"
import { useEffect, useState } from 'react';
import { getProfile, logout } from '@/services/authServices';
import { useAuth } from '@/AuthContext';
import { ErrorResponse, User } from '@/types/auth';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { access_token, setToken, setUser: setAuthUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!access_token) {
            router.push('/login');
            return;
        }
        getProfile()
            .then((profile) => setUser(profile))
            // .catch((err) => {
            //     const errorResponse = err as ErrorResponse;
            //     setError(errorResponse.message || 'Failed to load profile');
            // });
    }, [access_token, router]);

    const handleLogout = async () => {
        try {
            await logout();
            setToken(null);
            setAuthUser(null);
            router.push('/login');
        } catch (err) {
            const errorResponse = err as ErrorResponse;
            setError(errorResponse.message || 'Logout failed');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>Profile</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}