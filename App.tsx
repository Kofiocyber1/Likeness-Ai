import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import ChatInterface from './components/ChatInterface';
import BiometricScanner from './components/BiometricScanner';
import LegalAction from './components/LegalAction';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardHome onNavigate={setCurrentView} />;
      case ViewState.CHAT:
        return <ChatInterface />;
      case ViewState.SCANNER:
        return <BiometricScanner />;
      case ViewState.LEGAL:
        return <LegalAction />;
      default:
        return <DashboardHome onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;