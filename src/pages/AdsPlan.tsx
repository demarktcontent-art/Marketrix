import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { getEmbedUrl } from '../lib/utils';
import { ExternalLink, Plus, Trash2, Video, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { AdPlatform, AdStatus, AdItem } from '../types';

export default function AdsPlan() {
  const { products, adItems, addAd, updateAd, addAdFeedback } = useStore();
  const [activeTab, setActiveTab] = useState<AdPlatform>('Facebook');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [newLinkInputs, setNewLinkInputs] = useState<Record<string, string>>({});
  const [newFeedbackInputs, setNewFeedbackInputs] = useState<Record<string, string>>({});

  const platforms: AdPlatform[] = ['Facebook', 'TikTok', 'Google'];
  const statuses: AdStatus[] = ['Planning', 'Ready to Live Ad', 'Live Ad'];

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getAdForProduct = (productId: string, platform: AdPlatform) => {
    return adItems.find(ad => ad.productId === productId && ad.platform === platform);
  };

  const handleStatusChange = (adId: string | undefined, productId: string, newStatus: AdStatus) => {
    if (adId) {
      updateAd(adId, { status: newStatus });
    } else {
      addAd({
        productId,
        platform: activeTab,
        status: newStatus,
        mediaLinks: []
      });
    }
  };

  const handleAddMediaLink = (adId: string | undefined, productId: string) => {
    const link = newLinkInputs[productId];
    if (!link || !link.trim()) return;
    
    if (adId) {
      const ad = adItems.find(a => a.id === adId);
      if (ad) {
        updateAd(adId, { mediaLinks: [...ad.mediaLinks, link] });
      }
    } else {
      addAd({
        productId,
        platform: activeTab,
        status: 'Planning',
        mediaLinks: [link]
      });
    }
    
    setNewLinkInputs({ ...newLinkInputs, [productId]: '' });
  };

  const handleRemoveMediaLink = (adId: string, linkIndex: number) => {
    const ad = adItems.find(a => a.id === adId);
    if (ad) {
      const newLinks = [...ad.mediaLinks];
      newLinks.splice(linkIndex, 1);
      updateAd(adId, { mediaLinks: newLinks });
    }
  };

  const handleAddFeedback = (productId: string) => {
    const text = newFeedbackInputs[productId];
    if (!text || !text.trim()) return;

    addAdFeedback({
      productId,
      text
    });

    setNewFeedbackInputs({ ...newFeedbackInputs, [productId]: '' });
  };

  const sortedProducts = [...products].sort((a, b) => {
    const adA = getAdForProduct(a.id, activeTab);
    const adB = getAdForProduct(b.id, activeTab);
    
    const statusOrder: Record<string, number> = {
      'Live Ad': 1,
      'Ready to Live Ad': 2,
      'Planning': 3
    };
    
    const statusA = adA?.status || 'Planning';
    const statusB = adB?.status || 'Planning';
    
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ads Plan</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => setActiveTab(platform)}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === platform
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {platform}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-4">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No products found. Add products in the Products section first.
            </div>
          ) : (
            sortedProducts.map(product => {
              const ad = getAdForProduct(product.id, activeTab);
              const isExpanded = expandedProducts.has(product.id);
              const status = ad?.status || 'Planning';
              const videoCount = ad?.mediaLinks.length || 0;

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div 
                    className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="mr-3">{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
                          <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                            View Product <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                      {product.websiteLink && (
                        <a 
                          href={product.websiteLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hidden sm:flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100"
                        >
                          Website <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(ad?.id, product.id, e.target.value as AdStatus)}
                        className={`text-sm font-medium rounded-full px-3 py-1 border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          status === 'Live Ad' ? 'bg-green-50 text-green-700 ring-green-600/20 focus:ring-green-600' :
                          status === 'Ready to Live Ad' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 focus:ring-blue-600' :
                          'bg-yellow-50 text-yellow-800 ring-yellow-600/20 focus:ring-yellow-600'
                        }`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button onClick={() => toggleProduct(product.id)} className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-4 bg-white">
                      <div className="mb-4 flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Paste Facebook post link or Google Drive link here..."
                          value={newLinkInputs[product.id] || ''}
                          onChange={(e) => setNewLinkInputs({ ...newLinkInputs, [product.id]: e.target.value })}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMediaLink(ad?.id, product.id);
                            }
                          }}
                        />
                        <Button onClick={() => handleAddMediaLink(ad?.id, product.id)} className="w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" /> Add Video
                        </Button>
                      </div>

                      {videoCount > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {ad?.mediaLinks.map((link, idx) => {
                            const embedUrl = getEmbedUrl(link);
                            return (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square flex flex-col">
                                {embedUrl ? (
                                  <iframe 
                                    src={embedUrl} 
                                    className="absolute inset-0 w-full h-full"
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                  />
                                ) : (
                                  <div className="p-4 flex flex-col items-center justify-center h-full text-center">
                                    <Video className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 mb-2 break-all line-clamp-3">{link}</span>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs font-medium">
                                      Open Link <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleRemoveMediaLink(ad.id, idx)}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remove Video"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          No videos added for this product on {activeTab} yet.
                        </div>
                      )}

                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                          Add Note / Feedback
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder="Type a note or feedback for this product..."
                            value={newFeedbackInputs[product.id] || ''}
                            onChange={(e) => setNewFeedbackInputs({ ...newFeedbackInputs, [product.id]: e.target.value })}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddFeedback(product.id);
                              }
                            }}
                          />
                          <Button onClick={() => handleAddFeedback(product.id)} variant="outline" className="w-full sm:w-auto">
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
