import React, { useState } from 'react';
import { Shift, ProductionRecord, User } from '../types';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { db } from '../services/mockDatabase';

interface DataEntryProps {
  shifts: Shift[];
  currentUser: User | null;
  onAddRecord: (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => Promise<void>;
}

const DataEntry: React.FC<DataEntryProps> = ({ shifts, currentUser, onAddRecord }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shiftId: shifts[0]?.id || '',
    productCount: '',
    downtimeMinutes: '0',
    defectCount: '0',
    comments: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setStatus('loading');

    // Validation
    if (!formData.shiftId || !formData.date || !formData.productCount) {
      setStatus('error');
      return;
    }

    try {
      const defects = parseInt(formData.defectCount);
      const downtime = parseInt(formData.downtimeMinutes);

      await onAddRecord({
        date: formData.date,
        shiftId: formData.shiftId,
        operatorId: currentUser.id,
        operatorName: currentUser.fullName,
        productCount: parseInt(formData.productCount),
        downtimeMinutes: downtime,
        defectCount: defects,
        comments: formData.comments
      });
      
      setStatus('success');
      
      // Check for thresholds and send Telegram alert
      const settings = await db.getSettings();
      if (defects > settings.maxDefects || downtime > settings.maxDowntime) {
        await telegramService.sendAlert(
          `⚠️ Внимание! Превышение показателей.\n` +
          `Оператор: ${currentUser.fullName}\n` +
          `Смена: ${formData.date}\n` +
          (defects > settings.maxDefects ? `❌ Брак: ${defects} шт.\n` : '') +
          (downtime > settings.maxDowntime ? `⏱️ Простой: ${downtime} мин.\n` : '') +
          (formData.comments ? `💬 Коммент: ${formData.comments}` : '')
        );
      }

      // Reset sensitive fields
      setFormData(prev => ({
        ...prev,
        productCount: '',
        downtimeMinutes: '0',
        defectCount: '0',
        comments: ''
      }));

    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ввод производственных данных</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Смена: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.fullName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Дата</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Смена</label>
            <select
              name="shiftId"
              value={formData.shiftId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
              required
            >
              <option value="" disabled>Выберите смену</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Продукция (шт)</label>
            <input
              type="number"
              min="0"
              name="productCount"
              value={formData.productCount}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Брак (шт)</label>
            <input
              type="number"
              min="0"
              name="defectCount"
              value={formData.defectCount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Простой (мин)</label>
            <input
              type="number"
              min="0"
              name="downtimeMinutes"
              value={formData.downtimeMinutes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Комментарии / Причина простоя</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
            placeholder="Опишите возникшие проблемы..."
          />
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md shadow-blue-900/10`}
          >
            {status === 'loading' ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save size={18} />
            )}
            Сохранить данные
          </button>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-fade-in">
              <CheckCircle size={20} />
              <span>Данные успешно сохранены</span>
            </div>
          )}
          
          {status === 'error' && (
             <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-fade-in">
             <AlertCircle size={20} />
             <span>Ошибка сохранения. Проверьте поля.</span>
           </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default DataEntry;