import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Setup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/setup', { email, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Setup failed. Master Admin might already exist.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="p-8 bg-card text-card-foreground rounded-lg shadow-md w-96 border border-border">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">Welcome to Kernel</h2>
                    <p className="text-sm text-muted-foreground mt-2">Create your Master Admin account</p>
                </div>
                
                {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}
                {success && <p className="mb-4 text-sm text-green-500 text-center">Account created! Redirecting to login...</p>}
                
                <form onSubmit={handleSetup} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        className="p-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={success}
                    />
                    <input
                        type="password"
                        placeholder="Secure Password"
                        className="p-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={success}
                    />
                    <button 
                        type="submit" 
                        className="p-2 text-primary-foreground bg-primary rounded hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
                        disabled={success}
                    >
                        Initialize Platform
                    </button>
                </form>
                
                <div className="mt-4 text-sm text-center text-muted-foreground">
                    Already set up? <Link to="/login" className="text-blue-500 hover:underline">Go to Login</Link>
                </div>
            </div>
        </div>
    );
}