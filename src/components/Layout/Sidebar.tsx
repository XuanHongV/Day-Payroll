import React from 'react';

import {
  Home,
  Users,
  Building,
  Clock,
  DollarSign,
  Calendar,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}


const menuItems = [
  { id: 'dashboard', label: 'Trang tổng quan', icon: Home },
  { id: 'employees', label: 'Quản lý Nhân viên', icon: Users },
  { id: 'departments', label: 'Quản lý Phòng ban', icon: Building },
  { id: 'shifts', label: 'Cấu hình Ca', icon: Briefcase },
  { id: 'schedule', label: 'Phân Ca', icon: Calendar },
  { id: 'attendance', label: 'Quản lý Chấm công', icon: Clock },
  { id: 'payroll', label: 'Quản lý Bảng lương', icon: DollarSign },

];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (

    <aside className="bg-indigo-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 flex items-center justify-center border-b border-indigo-800">


        <h1 className="text-xl font-bold text-white">Payroll D-App</h1>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};