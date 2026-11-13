import React, { useState, useEffect } from 'react';
import { 
  Database, Award, Workflow, Plus, Play, Sparkles, ArrowRight, 
  Clock, Download, FileSpreadsheet, CheckCircle2, RefreshCw, BarChart2
} from 'lucide-react';
import { getDatasets, getModels, getModelDownloadUrl } from '../services/api';

export default function DashboardPage({ onNavigate, onLaunchWorkflowWithTemplate }) {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dsRes, mdRes] = await Promise.all([getDatasets(), getModels()]);
      if (dsRes?.success) setDatasets(dsRes.datasets);
      if (mdRes?.success) setModels(mdRes.models);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
            Workspace Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome to ML Flow Studio
          </h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
            Create end-to-end Machine Learning pipelines visually. No code required—just upload data, connect nodes, and predict.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('builder')}
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Workflow className="w-4 h-4" />
            <span>Launch Visual Canvas</span>
          </button>
          <button
            onClick={() => onNavigate('datasets')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">3</div>
            <div className="text-xs font-medium text-slate-500">Pipeline Templates</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{datasets.length}</div>
            <div className="text-xs font-medium text-slate-500">Available Datasets</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{models.length}</div>
            <div className="text-xs font-medium text-slate-500">Trained ML Models</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">6</div>
            <div className="text-xs font-medium text-slate-500">Supported Algorithms</div>
          </div>
        </div>
      </div>

      {/* Quick Launch Preset Pipelines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Quick Start Presets</h2>
            <p className="text-xs text-slate-500">One-click visual pipelines to begin exploring machine learning right now</p>
          </div>
          <button
            onClick={() => onNavigate('builder')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Open Empty Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => onLaunchWorkflowWithTemplate('iris-classification')}
            className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-xl hover:border-blue-400 cursor-pointer transition-all hover:shadow-soft group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Classification
              </span>
              <Play className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Iris Flower Classification
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Multi-class classification using Random Forest on 150 flower samples.
            </p>
          </div>

          <div 
            onClick={() => onLaunchWorkflowWithTemplate('titanic-pipeline')}
            className="p-4 bg-gradient-to-br from-purple-50/70 to-pink-50/40 border border-purple-200/80 rounded-xl hover:border-purple-400 cursor-pointer transition-all hover:shadow-soft group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                Data Cleaning
              </span>
              <Play className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Titanic Survival & Missing Values
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Imputes missing ages, encodes categorical features, and runs Logistic Regression.
            </p>
          </div>

          <div 
            onClick={() => onLaunchWorkflowWithTemplate('student-regression')}
            className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 rounded-xl hover:border-emerald-400 cursor-pointer transition-all hover:shadow-soft group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Regression
              </span>
              <Play className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Student Grade Prediction
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Predicts continuous final exam scores from study habits using Linear Regression.
            </p>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Datasets & Trained Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datasets Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> Datasets
            </h3>
            <button
              onClick={() => onNavigate('datasets')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {datasets.slice(0, 4).map(ds => (
              <div
                key={ds.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600 shadow-2xs">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 capitalize">{ds.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {ds.rows} rows • {ds.columns} columns • {ds.size_kb} KB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('builder')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Load in Canvas
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trained Models Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" /> Trained Models
            </h3>
            <button
              onClick={() => onNavigate('models')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              View All ({models.length}) →
            </button>
          </div>

          {models.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No trained models yet.</p>
              <button
                onClick={() => onNavigate('builder')}
                className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Train First Model
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {models.slice(0, 4).map(md => {
                const isClf = md.problem_type === 'classification';
                const mainMetric = isClf 
                  ? `${md.metrics?.accuracy ?? '--'}% Acc` 
                  : `R²: ${md.metrics?.r2_score ?? '--'}`;

                return (
                  <div
                    key={md.model_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800">{md.algorithm_name || md.algorithm}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {mainMetric}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Target: <span className="font-semibold text-slate-700">{md.target_column}</span> • {md.problem_type}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onNavigate('predictions')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Predict
                      </button>
                      <a
                        href={getModelDownloadUrl(md.model_id)}
                        download
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors"
                        title="Download .joblib"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
