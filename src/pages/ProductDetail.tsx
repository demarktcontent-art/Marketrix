import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { getEmbedUrl } from '../lib/utils';
import { ContentType, ContentStatus, AdPlatform, AdStatus } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, contentItems, adItems, addContent, addAd, updateAd } = useStore();
  
  const [activeTab, setActiveTab] = useState<'content' | 'ads'>('content');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const product = products.find(p => p.id === id);
  const productContent = contentItems.filter(c => c.productId === id);
  const productAds = adItems.filter(a => a.productId === id);

  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'Post' as ContentType,
    status: 'Idea' as ContentStatus,
    scheduledDate: '',
    description: ''
  });

  const [adForm, setAdForm] = useState({
    platform: 'Facebook' as AdPlatform,
    status: 'Planning' as AdStatus,
    mediaLink: ''
  });

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/products" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContent({
      productId: product.id,
      title: contentForm.title,
      type: contentForm.type,
      status: contentForm.status,
      scheduledDate: contentForm.scheduledDate,
      description: contentForm.description
    });
    setIsContentModalOpen(false);
    setContentForm({ title: '', type: 'Post', status: 'Idea', scheduledDate: '', description: '' });
  };

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingAd = adItems.find(a => a.productId === product.id && a.platform === adForm.platform);
    
    if (existingAd) {
      updateAd(existingAd.id, {
        status: adForm.status,
        mediaLinks: adForm.mediaLink ? [...existingAd.mediaLinks, adForm.mediaLink] : existingAd.mediaLinks
      });
    } else {
      addAd({
        productId: product.id,
        platform: adForm.platform,
        status: adForm.status,
        mediaLinks: adForm.mediaLink ? [adForm.mediaLink] : []
      });
    }
    
    setIsAdModalOpen(false);
    setAdForm({ platform: 'Facebook', status: 'Planning', mediaLink: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/products" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Buying Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${product.buyingPrice.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Selling Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${product.sellingPrice.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(product.sellingPrice - product.buyingPrice).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('content')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Plan ({productContent.length})
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'ads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ads Plan ({productAds.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Content Ideas & Schedule</h3>
                <Button size="sm" onClick={() => setIsContentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Content
                </Button>
              </div>
              
              {productContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productContent.map(content => (
                    <Card key={content.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {content.type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            content.status === 'Published' ? 'bg-green-100 text-green-800' :
                            content.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {content.status}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{content.title}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{content.description}</p>
                        <div className="text-xs text-gray-500">
                          Scheduled: {content.scheduledDate ? new Date(content.scheduledDate).toLocaleDateString() : 'TBD'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No content planned yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Ad Campaigns & Media</h3>
                <Button size="sm" onClick={() => setIsAdModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Ad Campaign
                </Button>
              </div>

              {productAds.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {productAds.map(ad => (
                    <Card key={ad.id} className="overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{ad.platform} Ad</h4>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ad.status === 'Live Ad' ? 'bg-green-100 text-green-800' :
                          ad.status === 'Ready to Live Ad' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                      <CardContent className="p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Media Preview ({ad.mediaLinks.length})</h5>
                        {ad.mediaLinks.length > 0 ? (
                          <div className="space-y-3">
                            {ad.mediaLinks.map((link, idx) => {
                              const embedUrl = getEmbedUrl(link);
                              return (
                                <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                  {embedUrl ? (
                                    <div className="aspect-video relative">
                                      <iframe 
                                        src={embedUrl} 
                                        className="absolute inset-0 w-full h-full"
                                        allowFullScreen
                                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                      />
                                    </div>
                                  ) : (
                                    <div className="p-4 flex items-center justify-between">
                                      <span className="text-sm text-gray-600 truncate max-w-[200px]">{link}</span>
                                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-sm">
                                        Open Link <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">No media links added.</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No ads planned yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Modal */}
      <Modal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} title="Add Content Plan">
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input required value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} placeholder="e.g. Unboxing Video" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select value={contentForm.type} onChange={e => setContentForm({...contentForm, type: e.target.value as ContentType})}>
                <option value="Post">Post</option>
                <option value="Reel">Reel</option>
                <option value="Story">Story</option>
                <option value="Video">Video</option>
                <option value="Blog">Blog</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={contentForm.status} onChange={e => setContentForm({...contentForm, status: e.target.value as ContentStatus})}>
                <option value="Idea">Idea</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Published">Published</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <Input type="date" value={contentForm.scheduledDate} onChange={e => setContentForm({...contentForm, scheduledDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
            <textarea 
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={contentForm.description}
              onChange={e => setContentForm({...contentForm, description: e.target.value})}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsContentModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Content</Button>
          </div>
        </form>
      </Modal>

      {/* Ad Modal */}
      <Modal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} title="Add Ad Campaign">
        <form onSubmit={handleAdSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <Select value={adForm.platform} onChange={e => setAdForm({...adForm, platform: e.target.value as AdPlatform})}>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Google">Google</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={adForm.status} onChange={e => setAdForm({...adForm, status: e.target.value as AdStatus})}>
                <option value="Planning">Planning</option>
                <option value="Ready to Live Ad">Ready to Live Ad</option>
                <option value="Live Ad">Live Ad</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Link (Google Drive, Facebook Video URL)</label>
            <Input type="url" value={adForm.mediaLink} onChange={e => setAdForm({...adForm, mediaLink: e.target.value})} placeholder="https://drive.google.com/..." />
            <p className="text-xs text-gray-500 mt-1">Paste a link to the video/image. We'll try to generate a preview if it's from Drive or FB.</p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsAdModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Ad</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
