import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Package, FileText, Megaphone, TrendingUp, CalendarCheck, MessageSquare, Trash2, CheckCircle2, Circle, AlertTriangle, Clock, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { products, contentItems, adItems, pastReports, adFeedbacks, deleteAdFeedback, toggleAdFeedbackDone, userProfile, socialPosts, toggleSocialPostDone } = useStore();
  
  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  const isAdsManager = userProfile?.permissions?.canManageAds ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Ads Manager');
  const canManageContent = userProfile?.permissions?.canManageContent ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Content Manager');
  const canSeeBuyingPrice = userProfile?.permissions?.canSeeBuyingPrice ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Ads Manager');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const todayPosts = socialPosts.filter(post => post.date === today);

  // Count unique products that have at least one ad in "Live Ad" status
  const liveAdProductIds = new Set(adItems.filter(ad => ad.status === 'Live Ad').map(ad => ad.productId));
  const liveAdProductsCount = liveAdProductIds.size;

  // Count unique products that have at least one ad in "Ready to Live Ad" status
  const readyToLiveAdProductIds = new Set(adItems.filter(ad => ad.status === 'Ready to Live Ad').map(ad => ad.productId));
  const readyToLiveProductsCount = readyToLiveAdProductIds.size;

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Unknown Product';
  };

  const openDeleteModal = (id: string) => {
    setFeedbackToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (feedbackToDelete) {
      await deleteAdFeedback(feedbackToDelete);
      setIsDeleteModalOpen(false);
      setFeedbackToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Ideas</CardTitle>
              <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Products in Live Ad</CardTitle>
              <Megaphone className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{liveAdProductsCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Products Ready to Live</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{readyToLiveProductsCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Content Plan Section */}
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Today's Content Plan
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50">
              {todayPosts.length > 0 ? (
                todayPosts.map(post => (
                  <div key={post.id} className={`p-4 rounded-lg border shadow-sm relative group transition-all ${post.isDone ? 'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => canManageContent && toggleSocialPostDone(post.id)}
                          disabled={!canManageContent}
                          className={`flex-shrink-0 focus:outline-none ${!canManageContent ? 'cursor-default' : ''} ${post.isDone ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'}`}
                        >
                          {post.isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {post.type || 'Post'}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {post.themeProduct}
                        </span>
                      </div>
                    </div>
                    <div className="ml-7 space-y-2">
                      <p className={`text-sm font-medium ${post.isDone ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                        {post.visualDescription}
                      </p>
                      {post.copyCaption && (
                        <p className={`text-xs italic ${post.isDone ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'} line-clamp-2`}>
                          "{post.copyCaption}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-sm italic space-y-2">
                  <Clock className="h-8 w-8 text-gray-300 dark:text-gray-700" />
                  <p>No posts scheduled for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Ad Plan Feedback & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50">
              {adFeedbacks && adFeedbacks.length > 0 ? (
                adFeedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(feedback => (
                  <div key={feedback.id} className={`p-4 rounded-lg border shadow-sm relative group transition-all ${feedback.isDone ? 'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => isAdsManager && toggleAdFeedbackDone(feedback.id)}
                          disabled={!isAdsManager}
                          className={`flex-shrink-0 focus:outline-none ${!isAdsManager ? 'cursor-default' : ''} ${feedback.isDone ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'}`}
                        >
                          {feedback.isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feedback.isDone ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {getProductName(feedback.productId)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ml-7 ${feedback.isDone ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feedback.text}
                    </p>
                    {isAdsManager && (
                      <button
                        onClick={() => openDeleteModal(feedback.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm italic">
                  No feedback or notes added yet. Add them from the Ads Plan section.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Reports Section */}
        {pastReports && pastReports.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Past Content Reports</h3>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[450px] pr-2">
              {pastReports.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()).map(report => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <CalendarCheck className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      {report.monthName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{report.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${report.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Total Posts Planned:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.totalPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Successfully Completed:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{report.completedPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Missed / Undone:</span>
                        <span className="font-medium text-red-500 dark:text-red-400">{report.totalPosts - report.completedPosts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Feedback"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            <p className="font-medium">Are you sure you want to delete this feedback?</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. The feedback will be permanently removed.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
