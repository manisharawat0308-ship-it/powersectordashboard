import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-mulish" style={{ background: 'linear-gradient(135deg, #B02A30 0%, #8B1A1F 40%, #003D50 70%, #005B75 100%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-2xl font-black text-white mx-auto mb-4">
              IL
            </div>
            <h1 className="text-xl font-black text-gray-900">India Power Sector Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">ICICI Lombard Analytics</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-icici-maroon focus:border-transparent"
                placeholder="Enter username"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-icici-maroon focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-icici-maroon to-icici-navy text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-[14px] font-bold text-gray-500 uppercase mb-2 text-center">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-[14px]">
              <div className="text-center p-2 rounded bg-white border border-gray-200">
                <div className="font-bold text-gray-700">👤 User</div>
                <div className="text-gray-500 mt-0.5">user / user123</div>
              </div>
              <div className="text-center p-2 rounded bg-white border border-gray-200">
                <div className="font-bold text-gray-700">🔑 Admin</div>
                <div className="text-gray-500 mt-0.5">admin / admin123</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[14px] text-white/50 mt-4">
          Data: CEA • MNRE • National Power Portal • Ministry of Power
        </p>
      </div>
    </div>
  );
}


