import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, BrainCircuit, Settings, Ship, BookOpen, Bell, LogOut, User as UserIcon, X, Check, Menu, MessageSquare, Trash2 } from 'lucide-react';
import { ViewState, User, SystemNotification, Theme } from '../types';
import { db } from '../services/mockDatabase';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentUser: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  theme: Theme;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, currentUser, onLogout, children, theme }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadNotifs = async () => {
    const notifs = await db.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifs();
    // Poll for notifications every 10 seconds
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    await db.markNotificationsRead(); // In a real scenario, we might delete them
    setNotifications([]);
    setUnreadCount(0);
  };

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Дашборд', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR'] },
    { id: ViewState.JOURNAL, label: 'Журнал смен', icon: BookOpen, roles: ['ADMIN', 'OPERATOR'] },
    { id: ViewState.ENTRY, label: 'Ввод данных', icon: PlusCircle, roles: ['OPERATOR', 'ADMIN'] },
    { id: ViewState.ANALYTICS, label: 'AI Аналитика', icon: BrainCircuit, roles: ['ADMIN'] },
    { id: ViewState.SETTINGS, label: 'Настройки', icon: Settings, roles: ['ADMIN'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(currentUser?.role || ''));

  const handleNavClick = (view: ViewState) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) return <>{children}</>;

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'} font-sans transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg shadow-blue-900/50">
              <Ship size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">ССК ЗВЕЗДА</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Production Monitor</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900 dark:bg-slate-950">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold shadow-inner border border-slate-600">
                   {currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0,2)}
                </div>
                <div className="overflow-hidden">
                   <p className="text-sm font-semibold text-white truncate leading-tight">{currentUser.fullName}</p>
                   <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
                     {currentUser.role === 'ADMIN' ? 'Администратор' : 'Оператор'}
                   </p>
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 py-2.5 rounded-lg transition-colors border border-transparent hover:border-slate-600"
             >
               <LogOut size={14} /> ВЫЙТИ ИЗ СИСТЕМЫ
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0 transition-colors">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
             >
               <Menu size={24} />
             </button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight truncate">
               {navItems.find(i => i.id === currentView)?.label}
             </h2>
           </div>

           <div className="flex items-center gap-4 md:gap-6 relative">
              <div className="hidden md:flex flex-col items-end mr-2">
                 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Текущее время</span>
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-mono">
                   {new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

              <div className="relative">
                <button 
                  className={`relative p-2 md:p-2.5 rounded-full transition-all duration-200 ${
                    showNotifPanel 
                      ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800' 
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                >
                   <Bell size={20} className="md:w-6 md:h-6" />
                   {unreadCount > 0 && (
                     <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                   )}
                </button>

                {/* Notification Dropdown / Journal */}
                {showNotifPanel && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setShowNotifPanel(false)}></div>
                    <div className="absolute top-12 right-0 md:top-14 w-[calc(100vw-2rem)] md:w-96 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-700 z-50 animate-fade-in-up flex flex-col max-h-[70vh]">
                       <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                          <h3 className="font-bold text-slate-800 dark:text-white">Журнал уведомлений</h3>
                          <div className="flex gap-2">
                            {notifications.length > 0 && (
                              <button onClick={handleClearAll} className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1">
                                <Trash2 size={12} /> Очистить
                              </button>
                            )}
                            <button onClick={() => setShowNotifPanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              <X size={18} />
                            </button>
                          </div>
                       </div>
                       
                       <div className="overflow-y-auto custom-scrollbar flex-1 p-2 bg-white dark:bg-slate-800">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                               <Bell size={40} className="mb-3 opacity-20" />
                               <p className="text-sm font-medium">Уведомлений нет</p>
                               <p className="text-xs mt-1">Система работает в штатном режиме</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {notifications.map(n => (
                                <div key={n.id} className={`p-4 rounded-xl border transition-colors ${
                                  !n.read 
                                    ? 'bg-blue-50/60 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' 
                                    : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                                }`}>
                                   <div className="flex justify-between items-start mb-1.5">
                                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                       n.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                                       n.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                                       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                     }`}>
                                       {n.type === 'error' ? 'Ошибка' : n.type === 'warning' ? 'Внимание' : 'Инфо'}
                                     </span>
                                     <span className="text-[10px] text-slate-400 font-mono">
                                       {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </span>
                                   </div>
                                   <h4 className="text-sm font-bold mb-1 text-slate-800 dark:text-white">
                                     {n.title}
                                   </h4>
                                   <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2 font-medium">{n.message}</p>
                                   
                                   {/* Operator Comment Field */}
                                   {n.comment && (
                                     <div className="flex gap-2 items-start mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                        <MessageSquare size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                          "{n.comment}"
                                        </p>
                                     </div>
                                   )}
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                       <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
                          Показаны последние {notifications.length} событий
                       </div>
                    </div>
                  </>
                )}
             </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-10 scroll-smooth">
           <div className="max-w-7xl mx-auto w-full">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;