import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { Upload, Copy, CheckCircle, Circle, Trash2, Calendar, Archive, CheckSquare, Square, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { SocialPost } from '../types';

export default function ContentPlan() {
  const { contentItems, products, socialPosts, addSocialPosts, updateSocialPost, toggleSocialPostDone, deleteSocialPost, archiveAndClearSocialPosts, bulkToggleSocialPostDone, bulkDeleteSocialPost } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'monthly' | 'ideas'>('monthly');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveMonthName, setArchiveMonthName] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Unknown Product';
  };

  const statuses = ['Idea', 'In Progress', 'Review', 'Published'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        let wb;
        if (isCSV) {
          const text = evt.target?.result as string;
          wb = XLSX.read(text, { type: 'string' });
        } else {
          const arrayBuffer = evt.target?.result as ArrayBuffer;
          wb = XLSX.read(arrayBuffer, { type: 'array' });
        }
        
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newPosts = data.map((row: any) => {
          const getVal = (keys: string[]) => {
            const key = Object.keys(row).find(k => keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase())));
            return key ? String(row[key]) : '';
          };

          // Handle Excel date serial numbers if necessary
          let dateVal = getVal(['date', 'তারিখ']);
          if (typeof row['Date'] === 'number') {
             // Excel dates are days since Dec 30, 1899
             const dateObj = new Date(Math.round((row['Date'] - 25569) * 86400 * 1000));
             dateVal = dateObj.toISOString().split('T')[0];
          }

          return {
            date: dateVal,
            type: getVal(['type', 'format']),
            themeProduct: getVal(['theme', 'product', 'বিষয়']),
            visualDescription: getVal(['visual', 'description', 'ভিজ্যুয়াল']),
            copyCaption: getVal(['copy', 'caption', 'ক্যাপশন']),
          };
        }).filter(post => post.date || post.themeProduct || post.copyCaption);

        if (newPosts.length > 0) {
          addSocialPosts(newPosts);
          toast.success(`Imported ${newPosts.length} posts successfully!`);
        } else {
          toast.error("No valid data found. Please check your column headers.");
        }
      } catch (error) {
        toast.error("Error reading file. Please ensure it's a valid Excel or CSV file.");
      }
    };

    if (isCSV) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Caption copied to clipboard!");
  };

  const handleArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveMonthName.trim()) {
      toast.error("Please enter a month name.");
      return;
    }
    archiveAndClearSocialPosts(archiveMonthName);
    setIsArchiveModalOpen(false);
    setArchiveMonthName('');
    toast.success("Plan archived successfully! You can view it on the Dashboard.");
  };

  // Sort posts by date
  const sortedPosts = [...socialPosts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const toggleSelectPost = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === sortedPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(sortedPosts.map(p => p.id)));
    }
  };

  const handleBulkMarkDone = (isDone: boolean) => {
    bulkToggleSocialPostDone(Array.from(selectedPosts), isDone);
    setSelectedPosts(new Set());
    toast.success(`Marked ${selectedPosts.size} posts as ${isDone ? 'done' : 'undone'}`);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedPosts.size} posts?`)) {
      bulkDeleteSocialPost(Array.from(selectedPosts));
      setSelectedPosts(new Set());
      toast.success(`Deleted ${selectedPosts.size} posts`);
    }
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateSocialPost(editingPost.id, editingPost);
      setIsEditModalOpen(false);
      setEditingPost(null);
      toast.success("Post updated successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Content Plan</h2>
        <div className="flex space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import Excel/CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monthly Calendar ({socialPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('ideas')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'ideas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Product Ideas Board ({contentItems.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              {socialPosts.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      {selectedPosts.size === sortedPosts.length && sortedPosts.length > 0 ? (
                        <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 mr-2 text-gray-400" />
                      )}
                      Select All
                    </button>
                    {selectedPosts.size > 0 && (
                      <span className="text-sm text-gray-500">
                        {selectedPosts.size} selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedPosts.size > 0 && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleBulkMarkDone(true)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Done
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleBulkMarkDone(false)}>
                          <Circle className="h-4 w-4 mr-2" />
                          Mark Undone
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsArchiveModalOpen(true)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive & Clear Plan
                    </Button>
                  </div>
                </div>
              )}

              {sortedPosts.length > 0 ? (
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <Card key={post.id} className={`transition-all ${post.isDone ? 'bg-gray-50 opacity-75' : 'bg-white'} ${selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="p-4 flex flex-col md:flex-row gap-4">
                        {/* Left Column: Meta */}
                        <div className="md:w-1/4 space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm font-bold text-gray-900">
                              <button
                                onClick={() => toggleSelectPost(post.id)}
                                className="mr-2 text-gray-400 hover:text-gray-600"
                              >
                                {selectedPosts.has(post.id) ? (
                                  <CheckSquare className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Square className="h-5 w-5" />
                                )}
                              </button>
                              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                              {post.date || 'No Date'}
                            </div>
                            <button 
                              onClick={() => toggleSocialPostDone(post.id)}
                              className={`flex items-center justify-center rounded-full p-1 transition-colors ${post.isDone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                              title={post.isDone ? "Mark as Undone" : "Mark as Done"}
                            >
                              {post.isDone ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                            </button>
                          </div>
                          
                          {post.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {post.type}
                            </span>
                          )}
                          
                          <div>
                            <h4 className={`text-sm font-semibold ${post.isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {post.themeProduct}
                            </h4>
                          </div>
                        </div>

                        {/* Middle Column: Visual Description */}
                        <div className="md:w-1/3 space-y-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visual Description</h5>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.visualDescription}</p>
                        </div>

                        {/* Right Column: Caption & Actions */}
                        <div className="md:w-5/12 space-y-2 flex flex-col">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Copy Caption</h5>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.copyCaption)} className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Copy className="h-4 w-4 mr-1.5" /> Copy
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)} className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteSocialPost(post.id)} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap flex-1">
                            {post.copyCaption}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No imported posts yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Import your monthly content plan from an Excel or CSV file. Ensure your columns have headers like "Date", "Type", "Theme", "Visual Description", and "Caption".
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel/CSV
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ideas' && (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {statuses.map(status => {
                const items = contentItems.filter(c => c.status === status);
                return (
                  <div key={status} className="flex-1 min-w-[300px] bg-gray-100 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
                      {status}
                      <span className="bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs">{items.length}</span>
                    </h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <Card key={item.id} className="bg-white shadow-sm border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{item.title}</h4>
                            <Link to={`/products/${item.productId}`} className="text-xs text-blue-600 hover:underline">
                              {getProductName(item.productId)}
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                      {items.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                          No items
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Current Plan"
      >
        <form onSubmit={handleArchive} className="space-y-4">
          <p className="text-sm text-gray-600">
            This will save your current progress as a report and clear the board so you can import a new month's plan.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name (e.g., February 2026)</label>
            <Input
              required
              value={archiveMonthName}
              onChange={(e) => setArchiveMonthName(e.target.value)}
              placeholder="e.g. February 2026"
              autoFocus
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Archive & Clear
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        title="Edit Post"
      >
        {editingPost && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={editingPost.date}
                onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Input
                value={editingPost.type}
                onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme / Product</label>
              <Input
                value={editingPost.themeProduct}
                onChange={(e) => setEditingPost({ ...editingPost, themeProduct: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visual Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={editingPost.visualDescription}
                onChange={(e) => setEditingPost({ ...editingPost, visualDescription: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                value={editingPost.copyCaption}
                onChange={(e) => setEditingPost({ ...editingPost, copyCaption: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => {
                setIsEditModalOpen(false);
                setEditingPost(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
