import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  FileText,
  X,
  Sparkles,
  Calendar,
  Globe,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Upload,
  FileUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useStore } from '../store/useStore';
import { ContentPlan as ContentPlanType, Platform, Product } from '../types';
import { generateMarketingContent } from '../services/gemini';

const ContentModal = ({ isOpen, onClose }: any) => {
  const { products, addContentPlan } = useStore();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [platform, setPlatform] = useState<Platform>('shopee');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return toast.error('Please select a product');
    
    setIsGenerating(true);
    try {
      const content = await generateMarketingContent({
        name: product.name,
        description: product.description,
        platform
      });
      setGeneratedContent(content);
      toast.success('AI Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedContent) return;
    
    addContentPlan({
      id: uuidv4(),
      productId: selectedProductId,
      platform,
      title: generatedContent.title,
      body: generatedContent.body,
      hashtags: generatedContent.hashtags,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
    
    toast.success('Content plan saved to drafts');
    onClose();
    setGeneratedContent(null);
    setSelectedProductId('');
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const plans = results.data as any[];
        let count = 0;
        plans.forEach(plan => {
          if (plan.title && plan.body) {
            addContentPlan({
              id: uuidv4(),
              productId: plan.productId || '',
              platform: (plan.platform?.toLowerCase() as Platform) || 'all',
              title: plan.title,
              body: plan.body,
              hashtags: plan.hashtags ? plan.hashtags.split(',').map((s: string) => s.trim()) : [],
              status: 'draft',
              createdAt: new Date().toISOString(),
            });
            count++;
          }
        });
        toast.success(`Imported ${count} content plans from CSV`);
        onClose();
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error(error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Add Content Plan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl hover:bg-blue-100 transition-all group"
            >
              <FileUp className="w-10 h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-blue-900">Import CSV</span>
              <span className="text-xs text-blue-700 mt-1 text-center">Organize content from your spreadsheet</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleCsvUpload}
              />
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl">
              <Sparkles className="w-10 h-10 text-orange-500 mb-2" />
              <span className="font-bold text-orange-900">AI Generator</span>
              <span className="text-xs text-orange-700 mt-1 text-center">Let Gemini create content for you</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
              <span className="bg-white px-4">Or Manual / AI Generation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
              >
                <option value="shopee">Shopee</option>
                <option value="lazada">Lazada</option>
                <option value="tiktok">TikTok Shop</option>
              </select>
            </div>
          </div>

          {!generatedContent ? (
            <div className="text-center py-12 bg-orange-50 rounded-3xl border border-dashed border-orange-200">
              <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-orange-900 mb-2">AI Content Generator</h3>
              <p className="text-orange-700 text-sm mb-8 px-8">Select a product and platform to generate high-converting marketing copy with Gemini AI.</p>
              <button
                onClick={handleGenerate}
                disabled={!selectedProductId || isGenerating}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Generated Title</h4>
                <p className="text-xl font-bold text-gray-900 mb-6">{generatedContent.title}</p>
                
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Body Copy</h4>
                <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{generatedContent.body}</p>
                
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-sm text-orange-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setGeneratedContent(null)}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all"
                >
                  Save to Drafts
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function ContentPlan() {
  const { contentPlans, deleteContentPlan, products } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPlans = contentPlans.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (plan: ContentPlanType) => {
    const text = `${plan.title}\n\n${plan.body}\n\n${plan.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(plan.id);
    toast.success('Content copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Plan</h1>
          <p className="text-gray-500">Generate and manage AI-powered marketing content.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate Content
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search content plans..." 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlans.map((plan) => {
            const product = products.find(p => p.id === plan.productId);
            return (
              <motion.div
                layout
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      plan.platform === 'shopee' ? 'bg-orange-100 text-orange-600' :
                      plan.platform === 'lazada' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{plan.title}</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {plan.platform} • {product?.name || 'Unknown Product'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(plan)}
                      className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-all"
                    >
                      {copiedId === plan.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => deleteContentPlan(plan.id)}
                      className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-6">{plan.body}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {plan.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs text-orange-600 font-bold">#{tag.replace('#', '')}</span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      {plan.status === 'published' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{plan.status}</span>
                    </div>
                    <button className="text-xs font-bold text-orange-600 hover:underline">
                      {plan.status === 'published' ? 'View Live' : 'Schedule'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No content plans yet</h3>
          <p className="text-gray-500 mb-8">Use our AI to generate high-converting copy for your products.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all"
          >
            Generate Your First Post
          </button>
        </div>
      )}

      <ContentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
