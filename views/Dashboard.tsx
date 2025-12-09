import React, { useMemo } from 'react';
import { ProductionRecord, Shift } from '../types';
import KpiCard from '../components/KpiCard';
import { Activity, AlertTriangle, Clock, Layers, TrendingUp, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  data: ProductionRecord[];
  shifts: Shift[];
}

const Dashboard: React.FC<DashboardProps> = ({ data, shifts }) => {
  
  // KPI Calculations
  const stats = useMemo(() => {
    const totalProd = data.reduce((acc, curr) => acc + curr.productCount, 0);
    const totalDefect = data.reduce((acc, curr) => acc + curr.defectCount, 0);
    const totalDowntime = data.reduce((acc, curr) => acc + curr.downtimeMinutes, 0);
    const defectRate = totalProd > 0 ? ((totalDefect / totalProd) * 100).toFixed(2) : '0';
    
    return {
      totalProd,
      totalDefect,
      totalDowntime,
      defectRate
    };
  }, [data]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Sort by date ascending
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(record => ({
      ...record,
      dateShort: record.date.slice(5), // MM-DD
      efficiency: record.productCount - (record.defectCount * 2) // Fake efficiency metric
    }));
  }, [data]);

  // Aggregated Shift Data (for Bar and Pie)
  const shiftStats = useMemo(() => {
    const map = new Map();
    shifts.forEach(s => map.set(s.id, { name: s.name, defects: 0, production: 0, downtime: 0 }));
    
    data.forEach(r => {
      const s = map.get(r.shiftId);
      if (s) {
        s.defects += r.defectCount;
        s.production += r.productCount;
        s.downtime += r.downtimeMinutes;
      }
    });
    
    return Array.from(map.values());
  }, [data, shifts]);

  // Colors for Donut Chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg text-xs">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="font-medium">{entry.name}:</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Обзор производства</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ключевые показатели эффективности (KPI) и динамика за период</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-600 dark:text-slate-300 self-start md:self-auto transition-colors">
           <Calendar size={14} />
           <span>Сегодня: {new Date().toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard 
          title="Выпуск продукции" 
          value={stats.totalProd.toLocaleString()} 
          subValue="единиц"
          icon={Layers} 
          color="blue"
        />
        <KpiCard 
          title="Уровень брака" 
          value={`${stats.defectRate}%`}
          subValue={parseFloat(stats.defectRate) > 5 ? 'Требует внимания' : 'В норме'} 
          icon={AlertTriangle} 
          color={parseFloat(stats.defectRate) > 5 ? 'red' : 'green'}
        />
        <KpiCard 
          title="Общий простой" 
          value={`${stats.totalDowntime} мин`} 
          subValue="по всем линиям"
          icon={Clock} 
          color="amber"
        />
        <KpiCard 
          title="Эффективность" 
          value="94.2%" 
          subValue="OEE индекс"
          icon={Activity} 
          color="blue"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production Trend - Wide Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
             <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Динамика выпуска</h3>
                <p className="text-xs text-slate-400">Количество произведенной продукции по дням</p>
             </div>
             <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                <TrendingUp size={20} />
             </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="dateShort" stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="productCount" 
                  name="Продукция" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProd)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Distribution - Donut Chart (Bagel) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Доли смен</h3>
            <p className="text-xs text-slate-400">Распределение выработки</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="production"
                  stroke="none"
                >
                  {shiftStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label for Donut */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
               <span className="block text-2xl font-bold text-slate-800 dark:text-white">{stats.totalProd}</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wide">Всего</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shift Comparison Bar Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Сравнение показателей</h3>
            <p className="text-xs text-slate-400 mb-6">Выпуск vs Брак по сменам</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shiftStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="production" name="Выпуск" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="defects" name="Брак" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correlation Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Качество и Простои</h3>
              <p className="text-xs text-slate-400">Корреляция дефектов и остановок линии</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="dateShort" stroke="#94a3b8" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="defectCount" name="Брак (шт)" fill="#fee2e2" stroke="#ef4444" strokeWidth={2} fillOpacity={0.5} />
                  <Line yAxisId="right" type="monotone" dataKey="downtimeMinutes" name="Простой (мин)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;