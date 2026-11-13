import React, { useState, useEffect } from 'react';
import { 
  Award, Download, Sparkles, Database, Clock, Layers, 
  BarChart3, RefreshCw, CheckCircle2, ChevronRight, FileCode
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { getModels, getModelDetails, getModelDownloadUrl } from '../services/api';

export default function ModelsPage({ onNavigate }) {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [modelDetails, setModelDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await getModels();
      if (res?.success) {
        setModels(res.models);
        if (res.models.length > 0) {
          loadDetails(res.models[0].model_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (mid) => {
    try {
      setLoadingDetails(true);
      setSelectedModelId(mid);
      const res = await getModelDetails(mid);
      if (res?.success) {
        setModelDetails(res.model);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const isClf = modelDetails?.problem_type === 'classification';
  const metrics = modelDetails?.evaluation?.metrics || {};
  const cm = modelDetails?.evaluation?.confusion_matrix;
  const featureImp = modelDetails?.evaluation?.feature_importance || [];
  const actualVsPred = modelDetails?.evaluation?.actual_vs_predicted || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-purple-600" />
            <span>Trained Models & Performance Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare model metrics, inspect confusion matrices, and export serialized .joblib model files.
          </p>
        </div>

        <button
          onClick={() => onNavigate('builder')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Train New Model</span>
        </button>
      </div>

      {models.length === 0 && !loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center space-y-3">
          <Award className="w-12 h-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No Models Trained Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Launch the visual canvas or training wizard to build and fit your first Scikit-learn model.
          </p>
          <button
            onClick={() => onNavigate('builder')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Launch Visual Canvas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Models List Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Trained Models ({models.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {models.map(md => {
                const isSelected = md.model_id === selectedModelId;
                const isClfModel = md.problem_type === 'classification';
                const mainScore = isClfModel 
                  ? `${md.metrics?.accuracy ?? '--'}% Acc` 
                  : `R²: ${md.metrics?.r2_score ?? '--'}`;

                return (
                  <div
                    key={md.model_id}
                    onClick={() => loadDetails(md.model_id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-400 shadow-2xs ring-2 ring-purple-100'
                        : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[160px]" title={md.algorithm_name}>
                        {md.algorithm_name || md.algorithm}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {mainScore}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Target: <span className="font-semibold text-slate-700">{md.target_column}</span>
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(md.created_at).toLocaleDateString()}</span>
                      <span className="capitalize">{md.problem_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Detailed View */}
          <div className="lg:col-span-2 space-y-6">
            {modelDetails ? (
              <div className="space-y-6">
                {/* Model Header Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{modelDetails.algorithm_name}</h2>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {modelDetails.problem_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target: <span className="font-bold text-slate-700">{modelDetails.target_column}</span> • Model ID: {modelDetails.model_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('predictions')}
                      className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Inference</span>
                    </button>
                    <a
                      href={getModelDownloadUrl(modelDetails.model_id)}
                      download
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .joblib</span>
                    </a>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {isClf ? (
                    <>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</span>
                        <div className="text-2xl font-black text-blue-600 mt-1">{metrics.accuracy ?? '--'}%</div>
                        <span className="text-[10px] text-slate-400">Train: {metrics.train_accuracy ?? '--'}%</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Precision</span>
                        <div className="text-2xl font-black text-purple-600 mt-1">{metrics.precision ?? '--'}%</div>
                        <span className="text-[10px] text-slate-400">Weighted</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Recall</span>
                        <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.recall ?? '--'}%</div>
                        <span className="text-[10px] text-slate-400">Sensitivity</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">F1 Score</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.f1_score ?? '--'}%</div>
                        <span className="text-[10px] text-slate-400">Harmonic</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">R² Score</span>
                        <div className="text-2xl font-black text-blue-600 mt-1">{metrics.r2_score ?? '--'}</div>
                        <span className="text-[10px] text-slate-400">Train: {metrics.train_r2 ?? '--'}</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">MAE</span>
                        <div className="text-2xl font-black text-purple-600 mt-1">{metrics.mae ?? '--'}</div>
                        <span className="text-[10px] text-slate-400">Mean Abs Error</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">RMSE</span>
                        <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.rmse ?? '--'}</div>
                        <span className="text-[10px] text-slate-400">Root Mean Sq</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">MSE</span>
                        <div className="text-2xl font-black text-amber-600 mt-1">{metrics.mse ?? '--'}</div>
                        <span className="text-[10px] text-slate-400">Mean Sq Error</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 mb-3">
                      {isClf ? 'Confusion Matrix' : 'Actual vs Predicted'}
                    </h4>
                    {isClf && cm ? (
                      <div className="overflow-x-auto py-2 flex justify-center">
                        <table className="text-xs text-center border-collapse border border-slate-200">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600">
                              <th className="p-2 border border-slate-200">Actual \ Pred</th>
                              {cm.labels.map(l => (
                                <th key={l} className="p-2 border border-slate-200 font-bold">{l}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cm.matrix.map((row, i) => (
                              <tr key={i}>
                                <td className="p-2 border border-slate-200 font-bold bg-slate-50">{cm.labels[i]}</td>
                                {row.map((val, j) => (
                                  <td
                                    key={j}
                                    className={`p-2 font-bold border border-slate-200 ${
                                      i === j
                                        ? val > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-400'
                                        : val > 0 ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-300'
                                    }`}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : actualVsPred.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={actualVsPred}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Actual" />
                            <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} name="Predicted" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 mb-3">Feature Importances</h4>
                    {featureImp.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={featureImp.slice(0, 6)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="feature" tick={{ fontSize: 10 }} width={75} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                        Feature importances not applicable for this model
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
