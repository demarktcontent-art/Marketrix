import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Megaphone,
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Globe,
  ArrowUpRight,
  Pause,
  Play,
  ExternalLink,
  Video
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { AdCampaign, Platform } from '../types';

const VideoPreview = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const isDrive = url.includes('drive.google.com');
  const isFB = url.includes('facebook.com');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full z-10 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="aspect-video bg-black flex items-center justify-center">
          {isDrive ? (
            <iframe 
              src={url.replace('/view', '/preview')} 
              className="w-full h-full" 
              allow="autoplay"
              title="Drive Video"
            />
          ) : isFB ? (
            <iframe 
              src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`} 
              className="w-full h-full" 
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="FB Video"
            />
          ) : (
            <div className="text-center p-12">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-white text-lg font-bold mb-4">Preview not available for this link type</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Open Original Link
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white">
          <h3 className="font-bold text-gray-900">Video Preview</h3>
          <p className="text-sm text-gray-500 truncate">{url}</p>
        </div>
      </motion.div>
    </div>
  );
};

const AdModal = ({ isOpen, onClose }: any) => {
  const { products, addAdCampaign } = useStore();
  const [formData, setFormData] = useState<Partial<AdCampaign>>({
    name: '',
    productId: '',
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    platform: 'shopee',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return toast.error('Please select a product');
    
    addAdCampaign({
      ...formData as AdCampaign,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    });
    
    toast.success('Ad campaign created successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">New Ad Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  placeholder="e.g. Summer Sale 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Product</label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Platform</label>
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                  className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
                >
                  <option value="shopee">Shopee Ads</option>
                  <option value="lazada">Lazada Solutions</option>
                  <option value="tiktok">TikTok Ads Manager</option>
                  <option value="facebook">Facebook Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Daily Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all"
            >
              Launch Campaign
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function AdsPlan() {
  const { adCampaigns, deleteAdCampaign, products, updateAdCampaign } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredCampaigns = adCampaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (campaign: AdCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateAdCampaign(campaign.id, { status: newStatus });
    toast.info(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Plan</h1>
          <p className="text-gray-500">Track and optimize your advertising spend.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900">$4,250.00</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            +12.5% from last month
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. ROAS</p>
              <p className="text-2xl font-bold text-gray-900">4.2x</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            +0.4x from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">1,240</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            -2.1% from last month
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Campaign</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Budget</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map((campaign) => {
                  const product = products.find(p => p.id === campaign.productId);
                  return (
                    <motion.tr 
                      layout
                      key={campaign.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{campaign.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">{product?.name || 'Unknown Product'}</p>
                              {product?.websiteLink && (
                                <a 
                                  href={product.websiteLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                                  title="Open Website"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {product?.videoLink && (
                                <button 
                                  onClick={() => setPreviewUrl(product.videoLink!)}
                                  className="p-1 hover:bg-orange-50 text-orange-500 rounded-lg transition-colors"
                                  title="Preview Video"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          campaign.platform === 'shopee' ? 'bg-orange-100 text-orange-600' :
                          campaign.platform === 'lazada' ? 'bg-blue-100 text-blue-600' :
                          campaign.platform === 'tiktok' ? 'bg-pink-100 text-pink-600' :
                          'bg-gray-100 text-gray-900'
                        }`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">${campaign.budget}</p>
                        <p className="text-xs text-gray-500">per day</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-600' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-600' :
                            campaign.status === 'paused' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }`} />
                          {campaign.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(campaign)}
                            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-orange-600 transition-all shadow-sm border border-transparent hover:border-gray-100"
                          >
                            {campaign.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => deleteAdCampaign(campaign.id)}
                            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-600 transition-all shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ad campaigns yet</h3>
            <p className="text-gray-500 mb-8">Plan your first advertising campaign to boost your sales.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all"
            >
              Start Advertising
            </button>
          </div>
        )}
      </div>

      <AdModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <AnimatePresence>
        {previewUrl && (
          <VideoPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
