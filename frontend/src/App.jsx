import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DatasetsPage from './pages/DatasetsPage';
import WorkflowCanvas from './workflow/WorkflowCanvas';
import PreprocessingPage from './pages/PreprocessingPage';
import TrainingPage from './pages/TrainingPage';
import PredictionPage from './pages/PredictionPage';
import ModelsPage from './pages/ModelsPage';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [initialCanvasTemplate, setInitialCanvasTemplate] = useState('iris-classification');

  const handleLaunchWithTemplate = (templateId) => {
    setInitialCanvasTemplate(templateId);
    setActivePage('builder');
  };

  const handleSelectDatasetForWorkflow = (datasetId, targetCol) => {
    // Switch to canvas
    setActivePage('builder');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 flex flex-col">
        {activePage === 'landing' && (
          <LandingPage onNavigate={setActivePage} />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            onNavigate={setActivePage}
            onLaunchWorkflowWithTemplate={handleLaunchWithTemplate}
          />
        )}

        {activePage === 'builder' && (
          <WorkflowCanvas initialTemplate={initialCanvasTemplate} />
        )}

        {activePage === 'datasets' && (
          <DatasetsPage
            onNavigate={setActivePage}
            onSelectDatasetForWorkflow={handleSelectDatasetForWorkflow}
          />
        )}

        {activePage === 'preprocessing' && (
          <PreprocessingPage onNavigate={setActivePage} />
        )}

        {activePage === 'training' && (
          <TrainingPage onNavigate={setActivePage} />
        )}

        {activePage === 'predictions' && (
          <PredictionPage onNavigate={setActivePage} />
        )}

        {activePage === 'models' && (
          <ModelsPage onNavigate={setActivePage} />
        )}
      </main>
    </div>
  );
}
