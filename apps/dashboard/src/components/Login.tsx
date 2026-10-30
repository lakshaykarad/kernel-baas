import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAccessToken } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      setAccessToken(response.data.access_token);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Changed bg-gray-650 to bg-card and added border-border */}
      <div className="p-8 bg-card text-card-foreground rounded-lg shadow-md w-96 border border-border">
        <h2 className="mb-6 text-2xl font-bold text-center">Admin Login</h2>
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="p-2 text-primary-foreground bg-primary rounded hover:opacity-90 transition-opacity font-medium">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}