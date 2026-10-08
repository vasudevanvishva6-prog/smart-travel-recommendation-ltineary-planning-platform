import React from 'react';
import { BudgetBreakdown } from '../types';
import { Car, Hotel, Utensils, Compass, Ticket, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BudgetPlannerWidgetProps {
  budget: BudgetBreakdown;
  onBudgetChange?: (newBudget: number) => void;
}

export const BudgetPlannerWidget: React.FC<BudgetPlannerWidgetProps> = ({ budget }) => {
  const percentUsed = Math.min(100, Math.round((budget.totalEstimatedCost / budget.userBudget) * 100));

  const items = [
    {
      label: 'Transportation',
      amount: budget.transportation,
      icon: <Car className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Flights, trains, cabs & local transfers',
    },
    {
      label: 'Hotel & Stays',
      amount: budget.hotel,
      icon: <Hotel className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Resorts, homestays or heritage hotels',
    },
    {
      label: 'Food & Dining',
      amount: budget.food,
      icon: <Utensils className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Breakfast, regional meals & popular cafes',
    },
    {
      label: 'Activities & Sports',
      amount: budget.activities,
      icon: <Compass className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Trekking, boat cruises & adventure tours',
    },
    {
      label: 'Entry Tickets',
      amount: budget.entryTickets,
      icon: <Ticket className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Museums, national parks & viewpoints',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs uppercase tracking-wider text-brand-600 font-bold">
            💰 Smart Budget Planner
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">Approximate Cost Breakdown</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Your Budget:</span>
          <span className="text-lg font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
            ₹{budget.userBudget.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <span className="text-slate-600">
            Estimated Spend: ₹{budget.totalEstimatedCost.toLocaleString('en-IN')} ({percentUsed}%)
          </span>
          {budget.remainingBudget >= 0 ? (
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Surplus: ₹{budget.remainingBudget.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="text-rose-600 flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Exceeds by: ₹{Math.abs(budget.remainingBudget).toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budget.remainingBudget >= 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-amber-500 to-rose-600'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Itemized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3"
          >
            <div className={`p-2.5 rounded-xl border ${item.color}`}>{item.icon}</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-500 block truncate">{item.label}</span>
              <span className="text-base font-bold text-slate-900 block">
                ₹{item.amount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{item.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Banner */}
      <div
        className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
          budget.remainingBudget >= 0
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              budget.remainingBudget >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold">
              {budget.remainingBudget >= 0 ? 'Remaining Budget' : 'Budget Deficit'}
            </div>
            <div className="text-2xl font-black">
              ₹{Math.abs(budget.remainingBudget).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="text-xs text-right sm:max-w-xs">
          {budget.remainingBudget >= 0 ? (
            <p>
              🎉 Great news! You have <strong>₹{budget.remainingBudget.toLocaleString('en-IN')}</strong> left for shopping and spontaneous local treats.
            </p>
          ) : (
            <p>
              ⚠️ Your trip plan slightly exceeds your target budget. Consider adjusting accommodation or activity choices.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
