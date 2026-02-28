import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Dashboard } from '../components/Dashboard';
import { ReportingEngine } from '../components/ReportingEngine';
import { IntegrityChecker } from '../components/IntegrityChecker';
import { Settings } from '../components/Settings';
import { UserManagement } from '../components/UserManagement';
import { AIAssistant } from '../components/AIAssistant';
import { WeeklyPerformanceEvaluation } from '../components/WeeklyPerformanceEvaluation';
import { Sidebar } from '../components/ui/Sidebar';
import { Header } from '../components/ui/Header';
import { Auth } from '../components/Auth';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      const hasCompletedTour = localStorage.getItem('joyride_completed');
      if (!hasCompletedTour && session) {
        setRunTour(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const tourSteps: Step[] = [
    {
      target: '#sidebar-dashboard-link',
      content: 'Welcome to your OKR dashboard! This is where you\'ll see an overview of your team\'s performance.',
      disableBeacon: true,
    },
    {
      target: '#sidebar-reporting-link',
      content: 'Here, you can manage and report on your weekly activities and key results.',
    },
    {
      target: '#sidebar-integrity-link',
      content: 'The Integrity Audit helps ensure data accuracy and compliance with governance protocols.',
    },
    {
      target: '#sidebar-ai-assistant-link',
      content: 'Your AI Assistant can help you draft objectives, analyze performance, and provide insights.',
    },
    {
      target: '#sidebar-settings-link',
      content: 'Adjust your personal and application settings here.',
    },
    {
      target: '#header-user-menu',
      content: 'Access your profile and sign out from this menu.',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('joyride_completed', 'true');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Loading...</div>;
  }

  return (
    <Router>
      {session ? (
        <div className="flex min-h-screen bg-slate-50">
          <Joyride
            run={runTour}
            steps={tourSteps}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
              options: {
                zIndex: 10000,
                primaryColor: '#f97316',
              },
              buttonNext: {
                backgroundColor: '#f97316',
              },
              buttonBack: {
                color: '#f97316',
              },
            }}
          />
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reporting" element={<ReportingEngine selectedYear={2024} />} />
                <Route path="/integrity" element={<IntegrityChecker />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/evaluation" element={<WeeklyPerformanceEvaluation />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Auth />
      )}
    </Router>
  );
};

export default App;
