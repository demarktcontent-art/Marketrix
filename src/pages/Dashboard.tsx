import React from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Package, FileText, Megaphone, TrendingUp, CalendarCheck, MessageSquare, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function Dashboard() {
  const { products, contentItems, adItems, pastReports, adFeedbacks, deleteAdFeedback, toggleAdFeedbackDone } = useStore();
  
  // Count unique products that have at least one ad in "Live Ad" status
  const liveAdProductIds = new Set(adItems.filter(ad => ad.status === 'Live Ad').map(ad => ad.productId));
  const liveAdProductsCount = liveAdProductIds.size;

  // Count unique products that have at least one ad in "Ready to Live Ad" status
  const readyToLiveAdProductIds = new Set(adItems.filter(ad => ad.status === 'Ready to Live Ad').map(ad => ad.productId));
  const readyToLiveProductsCount = readyToLiveAdProductIds.size;

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Unknown Product';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Content Ideas</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Products in Live Ad</CardTitle>
              <Megaphone className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{liveAdProductsCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Products Ready to Live</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{readyToLiveProductsCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feedback Section */}
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="border-b border-gray-100 bg-gray-50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Ad Plan Feedback & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {adFeedbacks && adFeedbacks.length > 0 ? (
                adFeedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(feedback => (
                  <div key={feedback.id} className={`bg-white p-4 rounded-lg border shadow-sm relative group transition-all ${feedback.isDone ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => toggleAdFeedbackDone(feedback.id)}
                          className={`flex-shrink-0 focus:outline-none ${feedback.isDone ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                          {feedback.isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feedback.isDone ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {getProductName(feedback.productId)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ml-7 ${feedback.isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {feedback.text}
                    </p>
                    <button
                      onClick={() => deleteAdFeedback(feedback.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Feedback"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                  No feedback or notes added yet. Add them from the Ads Plan section.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Reports Section */}
        {pastReports && pastReports.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Past Content Reports</h3>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[450px] pr-2">
              {pastReports.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()).map(report => (
                <Card key={report.id} className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                      <CalendarCheck className="h-5 w-5 mr-2 text-blue-600" />
                      {report.monthName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Completion Rate</span>
                          <span className="font-medium text-gray-900">{report.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${report.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Posts Planned:</span>
                        <span className="font-medium text-gray-900">{report.totalPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Successfully Completed:</span>
                        <span className="font-medium text-green-600">{report.completedPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Missed / Undone:</span>
                        <span className="font-medium text-red-500">{report.totalPosts - report.completedPosts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
