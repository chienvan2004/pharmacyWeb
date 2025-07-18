"use client";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/stores/authStore";
import { ClipLoader } from "react-spinners";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { setUser, setAccessToken } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            const error = searchParams.get("error");
            const provider = params.provider as string;

            // // Handle OAuth errors
            // if (error) {
            //     console.error(`OAuth error: ${error}`);
            //     alert(`Authentication failed: ${error}`);
            //     router.push("/dang-nhap");
            //     return;
            // }

            // if (!code || !provider) {
            //     alert("Authentication failed: No code or provider provided");
            //     router.push("/dang-nhap");
            //     return;
            // }

            try {
                // Forward the entire callback URL to your backend
                const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}/callback${window.location.search}`;

                const response = await axios.get<{
                    success: boolean;
                    user: {
                        id: number;
                        name: string;
                        email: string;
                        avatar: string;
                        account_type: string;
                        providers: string[];
                    };
                    access_token: string;
                    token_type: string;
                    message?: string;
                }>(callbackUrl);

                if (response.data.success) {
                    // Set cookie with better security
                    const isSecure = window.location.protocol === 'https:';
                    document.cookie = `token=${response.data.access_token}; path=/; max-age=3600; ${isSecure ? 'secure;' : ''} SameSite=Strict`;

                    setUser(response.data.user);
                    setAccessToken(response.data.access_token);

                    // Redirect to dashboard or intended page
                    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
                    sessionStorage.removeItem('redirectAfterLogin');
                    router.push(redirectTo);
                } else {
                    alert(`Authentication failed: ${response.data.message || 'Unknown error'}`);
                    router.push("/dang-nhap");
                }
            } catch (error: any) {
                console.error(`Error in ${provider} callback:`, error);
                const errorMessage = error.response?.data?.message || error.message || 'Authentication failed';
                alert(`Authentication failed: ${errorMessage}`);
                router.push("/dang-nhap");
            }
        };

        handleCallback();
    }, [params.provider, searchParams, router, setUser, setAccessToken]);

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-md">
                <ClipLoader color="#4f46e5" size={40} />
                <p className="text-gray-600">Authenticating with {params.provider}...</p>
                <p className="text-sm text-gray-400">Please wait while we complete your login</p>
            </div>
        </div>
    );
}