import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { User, UserRole } from '../types';
import { Plus, Edit, Trash2, Shield, Building2, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';

export default function Settings() {
  const { users, addUser, updateUser, deleteUser, companySettings, updateCompanySettings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [companyName, setCompanyName] = useState(companySettings.name || '');
  const [logoUrl, setLogoUrl] = useState(companySettings.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Ads Manager' as UserRole
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('User updated successfully');
    } else {
      addUser(formData);
      toast.success('User added successfully');
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Ads Manager' });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      deleteUser(id);
      toast.success('User removed successfully');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage users and roles</p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({ name: '', email: '', role: 'Ads Manager' });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

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
                        onClick={() => handleDelete(user.id)}
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
    </div>
  );
}
