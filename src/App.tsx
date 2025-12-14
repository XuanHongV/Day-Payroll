import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
// import Register from "./components/Auth/Register";
// import Login from "./components/Auth/Login";

import Dashboard from './components/Dashboard/Dashboard';
import { EmployeeManagement } from './components/Employees/EmployeeManagement';
import { DepartmentManagement } from './components/Departments/DepartmentManagement';
import { PayrollManagement } from './components/Payroll/PayrollManagement';
import { AttendanceManagement } from './components/Attendance/AttendanceManagement';

import { ShiftManagement } from './components/Shifts/ShiftManagement';
import { ScheduleManagement } from './components/Schedule/ScheduleManagement';

function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('register');


  // if (!isAuthed) {
  //   if (authPage === 'register') {
  //     return (
  //       <Register
  //         onWantLogin={() => setAuthPage('login')}
  //         onRegisterSuccess={() => setAuthPage('login')} 
  //       />
  //     );
  //   }

  //   if (authPage === 'login') { 
  //     return ( 
  //       <Login
  //         onSuccess={(userFromApi: any) => { 
  //           setIsAuthed(true);
  //           setUser(userFromApi); 
  //         }}
  //         onWantRegister={() => setAuthPage('register')}
  //       />
  //     );
  //   }
  // }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'shifts':
        return <ShiftManagement />;
      case 'schedule':
        return <ScheduleManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'settings':
        return <div className="p-6 text-gray-500">Trang Cài đặt đang được xây dựng...</div>;

      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthed(false);
    setAuthPage('login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;