'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Power,
  Edit3,
  BarChart3,
  Target,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';

interface Ad {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  spent: number;
  budget: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

const mockAds: Ad[] = [
  {
    id: 'ad-1',
    title: 'Summer Promo Campaign',
    impressions: 45230,
    clicks: 2341,
    spent: 1250,
    budget: 5000,
    active: true,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
  },
  {
    id: 'ad-2',
    title: 'Brand Awareness Q1',
    impressions: 28100,
    clicks: 890,
    spent: 3200,
    budget: 8000,
    active: true,
    startDate: '2025-01-15',
    endDate: '2025-04-15',
  },
  {
    id: 'ad-3',
    title: 'Product Launch',
    impressions: 12500,
    clicks: 1560,
    spent: 2100,
    budget: 3000,
    active: false,
    startDate: '2025-02-01',
    endDate: '2025-02-28',
  },
  {
    id: 'ad-4',
    title: 'Retargeting Campaign',
    impressions: 8900,
    clicks: 2340,
    spent: 890,
    budget: 2000,
    active: true,
    startDate: '2025-03-01',
    endDate: '2025-06-01',
  },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  impressions: Math.floor(Math.random() * 5000) + 1000,
  clicks: Math.floor(Math.random() * 500) + 50,
  ctr: Number((Math.random() * 5 + 1).toFixed(1)),
}));

interface AdFormData {
  title: string;
  description: string;
  image: string;
  link: string;
  budget: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
}

const initialFormData: AdFormData = {
  title: '',
  description: '',
  image: '',
  link: '',
  budget: '',
  targetAudience: '',
  startDate: '',
  endDate: '',
};

export default function AdsManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AdFormData>(initialFormData);
  const [ads, setAds] = useState(mockAds);

  function toggleAd(id: string) {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Create ad:', formData);
    setFormData(initialFormData);
    setShowForm(false);
  }

  function calcCTR(ad: Ad) {
    if (ad.impressions === 0) return '0';
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ad Campaigns</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
      </div>

      {/* Create Ad Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="glass-input w-full text-sm"
                    placeholder="Summer Promo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="glass-input w-full text-sm"
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="glass-input w-full text-sm resize-none h-20"
                    placeholder="Describe your ad campaign..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="glass-input w-full text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Destination Link
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="glass-input w-full text-sm"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    className="glass-input w-full text-sm"
                    placeholder="18-34, US, Interest: Gaming"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDate: e.target.value,
                        })
                      }
                      className="glass-input w-full text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDate: e.target.value,
                        })
                      }
                      className="glass-input w-full text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  Launch Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Performance (Last 30 Days)
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              Impressions
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              CTR %
            </span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 10]}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="impressions"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ctr"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ads Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  Campaign
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Impressions
                  </div>
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  <div className="flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" />
                    Clicks
                  </div>
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    CTR
                  </div>
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Spent
                  </div>
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <motion.tr
                  key={ad.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-glass-light transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">
                        {ad.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Budget: ${ad.budget.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {ad.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {ad.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {calcCTR(ad)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    ${ad.spent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAd(ad.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors',
                        ad.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-white/10',
                      )}
                    >
                      <Power className="w-3 h-3" />
                      {ad.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
