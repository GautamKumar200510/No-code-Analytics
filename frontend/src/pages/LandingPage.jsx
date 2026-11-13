import React, { useState } from 'react';
import { 
  Workflow, ArrowRight, Play, Database, Sliders, Cpu, 
  Sparkles, CheckCircle2, ShieldCheck, Zap, BarChart3, 
  HelpCircle, ChevronRight, Layers, FileSpreadsheet, Download
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [activeAlgoCategory, setActiveAlgoCategory] = useState('all');

  const algorithms = [
    {
      name: 'Random Forest',
      type: 'classification',
      cat: 'Ensemble',
      desc: 'Combines multiple decision trees to produce high accuracy and prevent overfitting.',
      formula: 'Ensemble of Bagged Trees',
      badge: 'Highly Popular',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Logistic Regression',
      type: 'classification',
      cat: 'Linear',
      desc: 'Models probability of binary or multi-class outcomes using logistic sigmoid function.',
      formula: 'p = 1 / (1 + e^-z)',
      badge: 'Fast & Explainable',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      name: 'Linear Regression',
      type: 'regression',
      cat: 'Linear',
      desc: 'Models continuous target values as a linear combination of explanatory features.',
      formula: 'y = w^T * x + b',
      badge: 'Classic Benchmark',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      name: 'Decision Tree',
      type: 'both',
      cat: 'Tree-based',
      desc: 'Creates a flowchart-like tree structure using entropy/Gini impurity splits.',
      formula: 'Information Gain / Gini',
      badge: 'Visual Rules',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'K-Nearest Neighbors (KNN)',
      type: 'both',
      cat: 'Instance-based',
      desc: 'Predicts target using voting or averaging among the K closest Euclidean distance neighbors.',
      formula: 'Euclidean Distance d(x, y)',
      badge: 'Intuitive Concept',
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Support Vector Machine (SVM)',
      type: 'both',
      cat: 'Kernel',
      desc: 'Finds optimal hyperplane with maximal margin separation in high-dimensional space.',
      formula: 'Max Margin Hyperplane',
      badge: 'High Precision',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const filteredAlgos = algorithms.filter(a => {
    if (activeAlgoCategory === 'all') return true;
    if (activeAlgoCategory === 'classification') return a.type === 'classification' || a.type === 'both';
    if (activeAlgoCategory === 'regression') return a.type === 'regression' || a.type === 'both';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-200 bg-white">
        {/* Soft Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/50 via-purple-100/40 to-pink-100/30 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Built for Beginners, Students & Data Enthusiasts</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Build Machine Learning Models <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Without Writing Code
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Drag and drop pipeline blocks, clean messy data, train real Scikit-learn models, 
            and generate interactive live predictions in a modern visual interface.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('builder')}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Get Started – Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Dashboard</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Real Scikit-learn Models</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Preloaded Iris & Titanic Datasets</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Coding Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Export Trained .joblib Models</span>
          </div>

          {/* Visual Showcase Preview Card */}
          <div className="mt-12 p-3 bg-gradient-to-b from-slate-200/60 to-slate-100 rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto">
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 p-4 sm:p-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-400 ml-2">ML Flow Pipeline Canvas</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-time Execution Ready
                </span>
              </div>

              {/* Simulated Flowchart Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">1. Data Source</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Iris Dataset</div>
                  <div className="text-[10px] text-slate-500">150 rows • 5 columns</div>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase">2. Preprocess</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Scale & Impute</div>
                  <div className="text-[10px] text-slate-500">StandardScaler applied</div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[10px] font-bold text-purple-700 uppercase">3. Algorithm</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Random Forest</div>
                  <div className="text-[10px] text-slate-500">100 trees • Max depth None</div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">4. Evaluation</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Accuracy: 96.7%</div>
                  <div className="text-[10px] text-slate-500">Confusion Matrix ✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Simple Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How ML Flow Works in 4 Steps
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Transform your raw dataset into trained Machine Learning models in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-blue-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Upload CSV Dataset</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your CSV file or test instantly with pre-loaded benchmark datasets (Iris, Titanic, Housing).
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-indigo-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Build Visual Flow</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag preprocessing, imputation, feature selection, and algorithm blocks onto the canvas and connect them.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-purple-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Train with Scikit-learn</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click "Run Workflow" to trigger real Python execution in the Flask backend with instant progress logs.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Evaluate & Predict</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect Confusion Matrices, R² metrics, and make live interactive predictions using the trained model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED ALGORITHMS SECTION */}
      <section className="py-16 sm:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Algorithms</h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Supported Machine Learning Models
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveAlgoCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeAlgoCategory === 'all' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (6)
              </button>
              <button
                onClick={() => setActiveAlgoCategory('classification')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeAlgoCategory === 'classification' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classification
              </button>
              <button
                onClick={() => setActiveAlgoCategory('regression')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeAlgoCategory === 'regression' ? 'bg-white text-cyan-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Regression
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlgos.map(algo => (
              <div
                key={algo.name}
                className="p-5 bg-slate-50/60 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all shadow-2xs hover:shadow-soft"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    {algo.cat}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {algo.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-800">{algo.name}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{algo.desc}</p>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Logic:</span>
                  <span className="font-semibold text-slate-700">{algo.formula}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">ML Flow</span>
              <p className="text-[11px] text-slate-400">No-Code Visual Drag-and-Drop Machine Learning Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
              Dashboard
            </button>
            <button onClick={() => onNavigate('builder')} className="hover:text-white transition-colors">
              Visual Canvas
            </button>
            <button onClick={() => onNavigate('datasets')} className="hover:text-white transition-colors">
              Datasets
            </button>
            <button onClick={() => onNavigate('predictions')} className="hover:text-white transition-colors">
              Predictions
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Powered by React Flow, Python Flask, Pandas & Scikit-learn
          </div>
        </div>
      </footer>
    </div>
  );
}
