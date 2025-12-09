import React, { useState } from 'react';
import { Sparkles, Bot, FileText, Loader2, Download, Calendar, DollarSign } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { analyzeProductionData } from '../services/geminiService';
import { saveAs } from 'file-saver';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Analytics: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  
  // Date Range State
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(weekAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setFinancialData(null);
    try {
      const { json, financials } = await db.getRecentStatsForAI(startDate, endDate);
      const result = await analyzeProductionData(json);
      setAnalysis(result);
      setFinancialData(financials);
    } catch (error) {
      setAnalysis("Не удалось выполнить анализ. Проверьте подключение.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;

    // Word Document Template with Title Page
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Отчет ССК Звезда</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
          .title-page { 
            height: 90vh; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            text-align: center;
          }
          h1 { color: #1e3a8a; font-size: 24pt; margin-bottom: 20px; }
          .subtitle { font-size: 14pt; color: #64748b; margin-bottom: 50px; }
          .meta { font-size: 11pt; color: #334155; margin-top: 100px; }
          .page-break { page-break-after: always; }
          h2 { color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; }
          p { line-height: 1.5; text-align: justify; }
          ul { margin-bottom: 10px; }
          li { margin-bottom: 5px; }
          .financial-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .financial-table th, .financial-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .financial-table th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
    `;

    const titlePage = `
      <div class="title-page" style="text-align: center; padding-top: 150px;">
        <h1 style="color:#0f172a; font-size: 32px; font-weight: bold;">АНАЛИТИЧЕСКИЙ ОТЧЕТ</h1>
        <p class="subtitle" style="color:#475569; font-size: 18px;">Производственные и финансовые показатели</p>
        
        <div style="margin-top: 100px;">
          <p><strong>Объект:</strong> Судостроительный комплекс "ЗВЕЗДА"</p>
          <p><strong>Период анализа:</strong> с ${startDate} по ${endDate}</p>
          <p><strong>Дата формирования:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-top: 200px; font-size: 12px; color: #94a3b8;">
          Сгенерировано автоматической системой мониторинга<br/>
          Модуль AI-аналитики (Gemini 2.5 Flash)
        </div>
      </div>
      <br clear=all style='mso-special-character:line-break;page-break-before:always'>
    `;

    const content = `
      <div class="content">
        <h2>Результаты анализа</h2>
        ${analysis
          .replace(/\n/g, '<br/>')
          .replace(/## (.*?)<br\/>/g, '<h2>$1</h2>')
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/- (.*?)<br\/>/g, '<li>$1</li>')
        }
      </div>
    `;

    const footer = "</body></html>";
    const sourceHTML = header + titlePage + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `SSK_Report_${new Date().toISOString().slice(0,10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Prepare chart data for financials
  const lossChartData = financialData ? [
    { name: 'Потери от брака', value: financialData.totalDefectCost, fill: '#ef4444' },
    { name: 'Потери от простоя', value: financialData.totalDowntimeCost, fill: '#f59e0b' }
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-600" fill="currentColor" fillOpacity={0.2} />
            AI Аналитика
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Генерация отчетов на основе данных производства
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-6 items-end transition-colors">
        
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Период: Начало</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
               type="date" 
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-slate-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600"
             />
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Период: Конец</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
               type="date" 
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-slate-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600"
             />
          </div>
        </div>
        
        <div className="md:col-span-4">
          <button
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
            {loading ? 'Обработка данных...' : 'Сформировать отчет'}
          </button>
        </div>
      </div>

      {/* Results Area */}
      {analysis && (
        <div className="space-y-6 animate-fade-in-up">
           
           {/* Financial Summary Cards */}
           {financialData && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Общие потери</p>
                 <p className="text-2xl font-bold text-red-600">{financialData.totalLosses.toLocaleString()} ₽</p>
               </div>
               <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Потери от брака</p>
                 <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{financialData.totalDefectCost.toLocaleString()} ₽</p>
                 <p className="text-xs text-slate-400 mt-1">{financialData.costPerDefect} ₽/шт</p>
               </div>
               <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Потери от простоя</p>
                 <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{financialData.totalDowntimeCost.toLocaleString()} ₽</p>
                 <p className="text-xs text-slate-400 mt-1">{financialData.costPerMinuteDowntime} ₽/мин</p>
               </div>
             </div>
           )}

           <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-purple-100 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 dark:border-slate-700 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-2 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white">Аналитический отчет</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Период: {startDate} — {endDate}</p>
                </div>
              </div>
              <button 
                 onClick={handleDownloadReport}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-200 transition text-sm font-medium"
                 title="Скачать в Word"
              >
                 <Download size={16} /> Экспорт в Word
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-li:text-slate-600 dark:prose-li:text-slate-300 relative z-10">
                 {/* Render simplified markdown */}
                 {analysis.split('\n').map((line, i) => {
                   if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold mt-6 mb-3 text-indigo-900 dark:text-indigo-300">{line.replace(/##/g, '')}</h3>;
                   if (line.startsWith('**')) return <p key={i} className="font-bold text-slate-800 dark:text-slate-200 my-2">{line.replace(/\*\*/g, '')}</p>;
                   if (line.startsWith('-')) return <li key={i} className="ml-4">{line.replace(/-/g, '')}</li>;
                   if (line.trim() === '') return <br key={i} />;
                   return <p key={i}>{line}</p>;
                 })}
              </div>
              
              {/* Financial Losses Chart */}
              <div className="lg:col-span-1">
                 {lossChartData.length > 0 && (
                   <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 text-center">Структура потерь</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={lossChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                            <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₽${val/1000}k`} />
                            <Tooltip 
                               contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                               itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                               formatter={(val: number) => [`${val.toLocaleString()} ₽`, 'Сумма']}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {lossChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-xs text-slate-400 mt-2">Финансовые потери за выбранный период</p>
                   </div>
                 )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                 <Bot size={14} />
                 Generated by Gemini 2.5 Flash
              </div>
              <div>ССК ЗВЕЗДА Internal System</div>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 gap-4 transition-colors">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full">
             <Bot size={40} className="text-slate-300 dark:text-slate-500" />
          </div>
          <p>Выберите даты и нажмите "Сформировать отчет", чтобы получить аналитику.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;