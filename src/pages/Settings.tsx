import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { User, UserRole } from '../types';
import { Plus, Edit, Trash2, Shield, Building2, Upload, Monitor, Check, X, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';

export default function Settings() {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    companySettings, 
    updateCompanySettings, 
    userProfile,
    approveDevice,
    rejectDevice
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const isAdmin = userProfile?.role === 'Admin';
  
  const [companyName, setCompanyName] = useState(companySettings.name || '');
  const [logoUrl, setLogoUrl] = useState(companySettings.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Ads Manager' as UserRole
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        updateCompanySettings({ logoUrl: base64String });
        toast.success('Company logo updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompanyName = () => {
    if (!companyName.trim()) {
      toast.error('Company name cannot be empty');
      return;
    }
    updateCompanySettings({ name: companyName });
    toast.success('Company name updated successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new users');
          return;
        }
        await addUser(formData);
        toast.success('User added successfully');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Ads Manager' });
    } catch (error) {
      // Error handled by handleFirestoreError in store
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        toast.success('User removed successfully');
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } catch (error) {
        // Error handled by handleFirestoreError
      }
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'Full access to all features, including user management.';
      case 'Ads Manager':
        return 'Can manage ads and import content plans.';
      case 'Content Manager':
        return 'Can manage and execute content plans.';
      default:
        return '';
    }
  };

  const usersWithPendingDevices = users.filter(u => u.pendingDevices && u.pendingDevices.length > 0);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Company settings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Company Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View company information.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="text-gray-900 font-medium">{companySettings.name || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                {companySettings.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Admin Access Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You do not have permission to manage users or edit company settings. Please contact an administrator for changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage users and roles</p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({ name: '', email: '', password: '', role: 'Ads Manager' });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Device Approvals Section */}
      {usersWithPendingDevices.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-800 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Pending Device Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersWithPendingDevices.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-2 space-y-1">
                      {user.pendingDevices.map(deviceId => (
                        <div key={deviceId} className="flex items-center text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          <code className="flex-1 truncate mr-2">{deviceId}</code>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => approveDevice(user.id, deviceId)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => rejectDevice(user.id, deviceId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-amber-600 font-medium bg-amber-100 px-3 py-1 rounded-full self-start sm:self-center">
                    {user.pendingDevices.length} Pending Request(s)
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Company Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your company name and logo.
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="flex gap-3 max-w-md">
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="MarketPlan"
              />
              <Button onClick={handleSaveCompanyName}>Save</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoUrl && (
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setLogoUrl('');
                        updateCompanySettings({ logoUrl: undefined });
                        toast.success('Company logo removed');
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended size: 256x256px. Max size: 2MB.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            User Access Control
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage who has access to {companySettings.name || 'MarketPlan'} and what they can do.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-200">Name</th>
                <th className="p-4 font-medium border-b border-gray-200">Email</th>
                <th className="p-4 font-medium border-b border-gray-200">Role</th>
                <th className="p-4 font-medium border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Ads Manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{getRoleDescription(user.role)}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => confirmDelete(user.id)}
                        disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value="Ads Manager">Ads Manager</option>
              <option value="Content Manager">Content Manager</option>
              <option value="Admin">Admin</option>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              {getRoleDescription(formData.role)}
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Save Changes' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Removal"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove this user? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Remove User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
