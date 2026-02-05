import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { Info, TrendingUp } from 'lucide-react';
import { AnalysisDataPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';

const Analysis: React.FC = () => {
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(10000);
  const [contributionYears, setContributionYears] = useState(10);
  const [totalYears, setTotalYears] = useState(20);
  const [irr, setIrr] = useState(5.0);
  const [fulfillmentRatio, setFulfillmentRatio] = useState(95);
  const { t } = useLanguage();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const calculateData = useMemo(() => {
    const data: AnalysisDataPoint[] = [];
    const adjustedRate = (irr / 100) * (fulfillmentRatio / 100);
    const FIRST_YEAR_PREMIUM_RATIO = 0.80;
    const RENEWAL_PREMIUM_RATIO = 0.95;

    let currentCost = initialInvestment;
    let currentValue = initialInvestment > 0 ? initialInvestment * FIRST_YEAR_PREMIUM_RATIO : 0;
    
    // Year 0
    data.push({
      year: 'Y0',
      totalCost: currentCost,
      cashValue: currentValue,
      breakeven: currentValue >= currentCost && currentCost > 0
    });

    let foundBreakeven = currentValue >= currentCost && currentCost > 0 ? 0 : -1;

    for (let year = 1; year <= totalYears; year++) {
      // 1. Interest on previous balance
      const interest = currentValue * adjustedRate;
      currentValue += interest;

      // 2. Add Contribution
      if (year <= contributionYears) {
        currentCost += annualContribution;
        
        if (initialInvestment === 0 && year === 1 && annualContribution > 0) {
            // First ever contribution gets hit by first year cost
            currentValue += (annualContribution * FIRST_YEAR_PREMIUM_RATIO);
        } else if (annualContribution > 0) {
            currentValue += (annualContribution * RENEWAL_PREMIUM_RATIO);
        }
      }

      const isBreakeven = currentValue >= currentCost;
      if (foundBreakeven === -1 && isBreakeven) {
          foundBreakeven = year;
      }

      data.push({
        year: `Y${year}`,
        totalCost: Math.round(currentCost),
        cashValue: Math.round(currentValue),
        breakeven: isBreakeven
      });
    }

    return { data, breakevenYear: foundBreakeven };
  }, [initialInvestment, annualContribution, contributionYears, totalYears, irr, fulfillmentRatio]);

  const { data: chartData, breakevenYear } = calculateData;
  
  // Calculate final metrics
  const finalData = chartData[chartData.length - 1];
  const totalInterest = finalData.cashValue - finalData.totalCost;

  const breakevenPoint = breakevenYear !== -1 ? chartData[breakevenYear] : null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-prepro-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('analysis.hero.title')}</h1>
            <p className="text-prepro-blue text-lg">{t('analysis.hero.desc')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Controls */}
            <div className="lg:col-span-4 space-y-8">
              <div className="border-b pb-4 mb-4">
                <h3 className="text-xl font-bold text-prepro-dark flex items-center gap-2">
                    <TrendingUp size={20} className="text-prepro-blue" /> {t('analysis.input.title')}
                </h3>
              </div>

              {[
                { label: t('analysis.label.initial'), val: initialInvestment, set: setInitialInvestment, max: 1000000, step: 1000, format: (v: number) => `$${v.toLocaleString()}` },
                { label: t('analysis.label.annual'), val: annualContribution, set: setAnnualContribution, max: 200000, step: 1000, format: (v: number) => `$${v.toLocaleString()}` },
                { label: t('analysis.label.years'), val: contributionYears, set: setContributionYears, max: 30, step: 1, format: (v: number) => `${v} ${t('common.year')}` },
                { label: t('analysis.label.totalYears'), val: totalYears, set: setTotalYears, max: 50, step: 1, format: (v: number) => `${v} ${t('common.year')}` },
                { label: t('analysis.label.irr'), val: irr, set: setIrr, max: 15, step: 0.1, format: (v: number) => `${v.toFixed(1)}%` },
                { label: t('analysis.label.ratio'), val: fulfillmentRatio, set: setFulfillmentRatio, max: 120, min: 50, step: 1, format: (v: number) => `${v}%` },
              ].map((input, idx) => (
                <div key={idx}>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-600">{input.label}</label>
                        <span className="font-bold text-prepro-blue">{input.format(input.val)}</span>
                    </div>
                    <input 
                        type="range"
                        min={input.min || 0}
                        max={input.max}
                        step={input.step}
                        value={input.val}
                        onChange={(e) => input.set(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-prepro-blue"
                    />
                </div>
              ))}
            </div>

            {/* Chart & Metrics */}
            <div className="lg:col-span-8 flex flex-col">
               <div className="h-[400px] w-full mb-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="year" 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickMargin={10} 
                            interval={Math.floor(totalYears / 5)}
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickFormatter={(val) => `$${val / 1000}k`} 
                        />
                        <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), '']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                            type="monotone" 
                            dataKey="totalCost" 
                            name={t('analysis.chart.cost')} 
                            stroke="#9ca3af" 
                            strokeWidth={2} 
                            dot={false}
                            fill="url(#colorCost)"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="cashValue" 
                            name={t('analysis.chart.value')} 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={false}
                        />
                        {breakevenPoint && (
                            <ReferenceDot 
                                x={breakevenPoint.year} 
                                y={breakevenPoint.cashValue} 
                                r={6} 
                                fill="#fbbf24" 
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        )}
                        {breakevenPoint && (
                             <ReferenceLine x={breakevenPoint.year} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'top', value: t('analysis.breakeven'), fill: '#d97706', fontSize: 12 }} />
                        )}
                    </LineChart>
                  </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                    <p className="text-gray-500 text-sm font-semibold mb-1">{t('analysis.metric.breakeven')}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {breakevenYear !== -1 ? `Y${breakevenYear}` : "> MAX"}
                    </p>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                    <p className="text-gray-500 text-sm font-semibold mb-1">{t('analysis.metric.interest')}</p>
                    <p className={`text-2xl font-bold ${totalInterest >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatCurrency(totalInterest)}
                    </p>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                    <p className="text-gray-500 text-sm font-semibold mb-1">{t('analysis.metric.total')}</p>
                    <p className="text-2xl font-bold text-prepro-blue">
                        {formatCurrency(finalData.cashValue)}
                    </p>
                 </div>
               </div>

               <div className="mt-6 flex items-start gap-2 bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <p>
                    {t('analysis.note')}
                  </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;