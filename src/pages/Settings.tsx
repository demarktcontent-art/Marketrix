import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun,
  Zap,
  ChevronRight,
  Mail,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

const SettingItem = ({ icon: Icon, title, description, action, color }: any) => (
  <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {action && <span className="text-sm font-bold text-orange-600">{action}</span>}
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
    </div>
  </div>
);

export default function Settings() {
  const user = useStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and app preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-400 to-orange-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase tracking-widest">Pro Plan</span>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full uppercase tracking-widest">Active</span>
              </div>
            </div>
            <button className="ml-auto px-6 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          <section>
            <div className="px-8 py-4 bg-gray-50/30">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</h3>
            </div>
            <SettingItem 
              icon={User} 
              title="Personal Information" 
              description="Update your name, email, and profile details"
              color="bg-blue-500"
            />
            <SettingItem 
              icon={Lock} 
              title="Security" 
              description="Manage your password and two-factor authentication"
              action="Secure"
              color="bg-orange-500"
            />
            <SettingItem 
              icon={CreditCard} 
              title="Billing & Subscription" 
              description="Manage your payment methods and plan"
              action="Manage"
              color="bg-purple-500"
            />
          </section>

          <section>
            <div className="px-8 py-4 bg-gray-50/30">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferences</h3>
            </div>
            <SettingItem 
              icon={Bell} 
              title="Notifications" 
              description="Configure how you receive alerts and updates"
              color="bg-green-500"
            />
            <SettingItem 
              icon={Globe} 
              title="Language & Region" 
              description="Set your preferred language and time zone"
              action="English (US)"
              color="bg-indigo-500"
            />
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gray-500 bg-opacity-10">
                  <Moon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </div>
            </div>
          </section>

          <section>
            <div className="px-8 py-4 bg-gray-50/30">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Integrations</h3>
            </div>
            <SettingItem 
              icon={Zap} 
              title="API Connections" 
              description="Connect your Shopee, Lazada, and TikTok Shop accounts"
              action="3 Connected"
              color="bg-yellow-500"
            />
            <div className="p-8">
              <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <ExternalLink className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900">Developer Documentation</h4>
                    <p className="text-sm text-orange-700">Learn how to use our API for custom integrations.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all">
                  Read Docs
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-center gap-8 text-sm text-gray-400 font-medium">
        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
        <a href="#" className="hover:text-gray-600">Terms of Service</a>
        <a href="#" className="hover:text-gray-600">Help Center</a>
      </div>
    </div>
  );
}
