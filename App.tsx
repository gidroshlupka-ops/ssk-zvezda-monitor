import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import DataEntry from './views/DataEntry';
import Analytics from './views/Analytics';
import Journal from './views/Journal';
import Settings from './views/Settings';
import Login from './views/Login';
import { ViewState, ProductionRecord, Shift, User, Theme } from './types';
import { db } from './services/mockDatabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [data, setData] = useState<ProductionRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const [fetchedData, fetchedShifts] = await Promise.all([
          db.getData(),
          db.getShifts()
        ]);
        setData(fetchedData);
        setShifts(fetchedShifts);
        
        // Load Theme
        const storedTheme = localStorage.getItem('ssk_theme') as Theme;
        if (storedTheme) setTheme(storedTheme);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(ViewState.LOGIN);
  };

  const handleAddRecord = async (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => {
    const newRecord = await db.addRecord(record);
    setData(prev => [newRecord, ...prev]);
  };

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ssk_theme', newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Загрузка системы...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard data={data} shifts={shifts} />;
      case ViewState.JOURNAL:
        return <Journal data={data} shifts={shifts} />;
      case ViewState.ENTRY:
        return <DataEntry shifts={shifts} currentUser={currentUser} onAddRecord={handleAddRecord} />;
      case ViewState.ANALYTICS:
        return currentUser.role === 'ADMIN' ? <Analytics /> : <div className="p-8 text-center text-red-500">Доступ запрещен</div>;
      case ViewState.SETTINGS:
        return currentUser.role === 'ADMIN' ? <Settings theme={theme} onThemeChange={toggleTheme} /> : <div className="p-8 text-center text-red-500">Доступ запрещен</div>;
      default:
        return <Dashboard data={data} shifts={shifts} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      currentUser={currentUser}
      onLogout={handleLogout}
      theme={theme}
    >
      {renderView()}
    </Layout>
  );
};

export default App;