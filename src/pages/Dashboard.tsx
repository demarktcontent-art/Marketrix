import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

export default function Dashboard() {
  const { products, contentPlans, adCampaigns } = useStore();

  const stats = [
    { title: 'Total Products', value: products.length, change: 12, icon: Package, color: 'bg-blue-500' },
    { title: 'Content Plans', value: contentPlans.length, change: 24, icon: FileText, color: 'bg-orange-500' },
    { title: 'Active Ads', value: adCampaigns.length, change: -5, icon: TrendingUp, color: 'bg-green-500' },
    { title: 'New Products', value: products.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, change: 18, icon: ShoppingCart, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Recent Content Plans</h2>
            <button className="text-orange-600 font-bold text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            {contentPlans.length > 0 ? (
              contentPlans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{plan.title}</h4>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{plan.platform}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    plan.status === 'published' ? 'bg-green-100 text-green-600' :
                    plan.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500">No content plans yet. Start generating!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Platform Distribution</h2>
          <div className="space-y-6">
            {['Shopee', 'Lazada', 'TikTok Shop'].map((platform) => (
              <div key={platform}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-700">{platform}</span>
                  <span className="text-gray-500">{Math.floor(Math.random() * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    className={`h-full rounded-full ${
                      platform === 'Shopee' ? 'bg-orange-500' :
                      platform === 'Lazada' ? 'bg-blue-500' :
                      'bg-black'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
