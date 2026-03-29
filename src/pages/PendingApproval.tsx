import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldAlert, LogOut, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store';

export default function PendingApproval() {
  const { logout, userProfile } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-amber-500">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h1>
          <p className="text-gray-500 mb-6">
            Your device is waiting for administrator approval. 
            Please contact your admin to grant access for this device.
          </p>

          <div className="bg-amber-50 p-4 rounded-lg text-left mb-8">
            <div className="flex items-start">
              <ShieldAlert className="h-5 w-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Account: {userProfile?.email}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Device ID: {localStorage.getItem('marketplan_device_id')}
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={logout} 
            className="w-full flex items-center justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
