import React, { useState } from 'react';
import { Ship, Lock, User, AlertCircle } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await db.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (e) {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 mb-4">
             <Ship size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ССК ЗВЕЗДА</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Система производственного мониторинга</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-800 transition-colors">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Логин сотрудника</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
                placeholder="Например: admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти в систему'}
          </button>
        </form>
        
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
           &copy; 2025 ССК ЗВЕЗДА. Конфиденциально.
        </div>
      </div>
    </div>
  );
};

export default Login;