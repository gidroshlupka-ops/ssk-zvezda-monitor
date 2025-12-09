import React, { useMemo, useState } from 'react';
import { ProductionRecord, Shift } from '../types';
import { Search, Filter, AlertTriangle } from 'lucide-react';

interface JournalProps {
  data: ProductionRecord[];
  shifts: Shift[];
}

const Journal: React.FC<JournalProps> = ({ data, shifts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('all');

  const getShiftName = (id: string) => shifts.find(s => s.id === id)?.name || id;

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.date.includes(searchTerm);
      const matchesShift = filterShift === 'all' || item.shiftId === filterShift;
      return matchesSearch && matchesShift;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, searchTerm, filterShift]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Журнал смен</h2>
        <p className="text-slate-500 dark:text-slate-400">История производственных показателей и ответственных операторов.</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по ФИО или дате (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Filter size={18} className="text-slate-400" />
           <select 
             value={filterShift} 
             onChange={(e) => setFilterShift(e.target.value)}
             className="w-full md:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white outline-none focus:border-blue-500"
           >
             <option value="all">Все смены</option>
             {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
           </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Дата</th>
                <th className="px-6 py-4 font-semibold">Смена / Время</th>
                <th className="px-6 py-4 font-semibold">Ответственный (ФИО)</th>
                <th className="px-6 py-4 font-semibold text-right">Продукция</th>
                <th className="px-6 py-4 font-semibold text-right">Брак</th>
                <th className="px-6 py-4 font-semibold text-right">Простой (мин)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {filteredData.length > 0 ? (
                filteredData.map(record => {
                  const shift = shifts.find(s => s.id === record.shiftId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{record.date}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div className="font-medium">{shift?.name}</div>
                        <div className="text-xs text-slate-400">{shift?.startTime} - {shift?.endTime}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                              {record.operatorName.charAt(0)}
                           </div>
                           {record.operatorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600 dark:text-blue-400">{record.productCount}</td>
                      <td className="px-6 py-4 text-right">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           record.defectCount > 5 
                             ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                             : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                         }`}>
                           {record.defectCount}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {record.downtimeMinutes > 45 && <AlertTriangle size={14} className="text-amber-500" />}
                          <span className={record.downtimeMinutes > 45 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                             {record.downtimeMinutes}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Записей не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journal;