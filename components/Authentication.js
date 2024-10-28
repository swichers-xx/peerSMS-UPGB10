  import { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';

export default function Authentication({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const { setTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const url = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        if (isLogin) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          
          // Fetch user preferences
          const userResponse = await fetch('/api/user', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user.preferences && userData.user.preferences.theme) {
              setTheme(userData.user.preferences.theme);
            }
          }

          onAuthenticated();
        } else {
          setError('Registration successful. Please log in.');
          setIsLogin(true);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (error) {
      console.error(isLogin ? 'Login error:' : 'Registration error:', error);
      setError('An unexpected error occurred');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="flex justify-between items-center">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {isLogin ? 'Login' : 'Register'}
          </button>
          <button type="button" onClick={toggleAuthMode} className="text-blue-500 hover:underline">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
