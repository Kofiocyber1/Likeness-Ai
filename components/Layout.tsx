import React, { useState } from 'react';
import { Shield, Lock, MessageSquare, FileText, Menu, X, Camera, Users, Zap } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-8 py-5 transition-all text-sm font-bold tracking-tight uppercase ${
        currentView === view
          ? 'text-black bg-gray-100 border-l-4 border-black'
          : 'text-gray-500 hover:text-black hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5 mr-4" strokeWidth={1.5} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-white text-black overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-30 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="h-24 flex items-center px-8">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-[#0081C8]">L</span>
            <span className="text-[#FCB131]">i</span>
            <span className="text-[#000000]">k</span>
            <span className="text-[#00A651]">e</span>
            <span className="text-[#EE334E]">n</span>
            <span className="text-[#0081C8]">e</span>
            <span className="text-[#FCB131]">s</span>
            <span className="text-[#000000]">s</span>
            <span className="text-[#00A651] ml-2">A</span>
            <span className="text-[#EE334E]">i</span>
          </h1>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          <NavItem view={ViewState.DASHBOARD} icon={Users} label="People & Groups" />
          <NavItem view={ViewState.CHAT} icon={MessageSquare} label="Ai Chat & Ideas" />
          <NavItem view={ViewState.SCANNER} icon={Camera} label="Scan Yourself" />
          <NavItem view={ViewState.LEGAL} icon={FileText} label="Legal Protection" />
        </nav>

        <div className="p-8">
          <div className="bg-gray-50 p-6 rounded-none border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Protection Level</p>
            <div className="w-full bg-gray-200 h-1 overflow-hidden mb-2">
              <div className="bg-[#00A651] h-full w-[92%]"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-black">Active</span>
              <span className="text-xs font-bold text-[#00A651]">98%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-24 border-b border-gray-100 flex items-center justify-between px-8 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <button 
            className="lg:hidden text-black hover:text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 lg:flex-none flex justify-end items-center gap-6">
             <button className="text-sm font-bold text-gray-400 hover:text-black uppercase transition-colors">
                Upload Visuals
             </button>
             <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                US
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative bg-white">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
