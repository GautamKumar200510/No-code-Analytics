import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, Download, ArrowRight, Zap, 
  BarChart3, Sparkles, RefreshCw, Activity, Layers, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ScatterChart, Scatter, Cell
} from 'recharts';
import { getModelDownloadUrl, predictModel } from '../services/api';

export default function WorkflowExecutionModal({ isOpen, onClose, result, isRunning }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'steps' | 'predict'
  const [testInputs, setTestInputs] = useState({});
  const [predictLoading, setPredictLoading] = useState(false);
  const [prediction, setPrediction] = useState(result?.sample_prediction || null);

  const evaluation = result?.evaluation;
  const isClassification = evaluation?.problem_type === 'classification';
  const metrics = evaluation?.metrics || {};
  const confusionMatrix = evaluation?.confusion_matrix;
  const featureImportance = evaluation?.feature_importance || [];
  const actualVsPred = evaluation?.actual_vs_predicted || [];
  const modelId = result?.model_id;

  const handlePredict = async () => {
    if (!modelId) return;
    try {
      setPredictLoading(true);
      const res = await predictModel(modelId, testInputs);
      if (res.success) {
        setPrediction(res.prediction);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-sm ${
              result?.success ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              {result?.success ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {result?.success ? 'Workflow Executed Successfully!' : 'Workflow Execution Status'}
              </h2>
              <p className="text-xs text-slate-500">
                {result?.model_metadata?.name || 'Pipeline Run'} • Total Time: {result?.execution_time_ms || 0} ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {modelId && (
              <a
                href={getModelDownloadUrl(modelId)}
                download
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Model (.joblib)</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-5 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Evaluation & Visualizations</span>
          </button>

          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Pipeline Execution Logs ({result?.steps?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('predict')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'predict'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Live Interactive Inference</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: METRICS & CHARTS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Primary Metric Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {isClassification ? (
                  <>
                    <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Test Accuracy</div>
                      <div className="text-2xl font-black text-blue-900 mt-1">{metrics.accuracy ?? '--'}%</div>
                      <div className="text-[10px] text-blue-500 mt-0.5">Train Acc: {metrics.train_accuracy ?? '--'}%</div>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Precision</div>
                      <div className="text-2xl font-black text-purple-900 mt-1">{metrics.precision ?? '--'}%</div>
                      <div className="text-[10px] text-purple-500 mt-0.5">Weighted average</div>
                    </div>
                    <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Recall</div>
                      <div className="text-2xl font-black text-indigo-900 mt-1">{metrics.recall ?? '--'}%</div>
                      <div className="text-[10px] text-indigo-500 mt-0.5">Sensitivity rate</div>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">F1-Score</div>
                      <div className="text-2xl font-black text-emerald-900 mt-1">{metrics.f1_score ?? '--'}%</div>
                      <div className="text-[10px] text-emerald-500 mt-0.5">Harmonic balance</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">R² Score</div>
                      <div className="text-2xl font-black text-blue-900 mt-1">{metrics.r2_score ?? '--'}</div>
                      <div className="text-[10px] text-blue-500 mt-0.5">Train R²: {metrics.train_r2 ?? '--'}</div>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">MAE</div>
                      <div className="text-2xl font-black text-purple-900 mt-1">{metrics.mae ?? '--'}</div>
                      <div className="text-[10px] text-purple-500 mt-0.5">Mean Absolute Error</div>
                    </div>
                    <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">RMSE</div>
                      <div className="text-2xl font-black text-indigo-900 mt-1">{metrics.rmse ?? '--'}</div>
                      <div className="text-[10px] text-indigo-500 mt-0.5">Root Mean Squared Error</div>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
                      <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">MSE</div>
                      <div className="text-2xl font-black text-amber-900 mt-1">{metrics.mse ?? '--'}</div>
                      <div className="text-[10px] text-amber-500 mt-0.5">Mean Squared Error</div>
                    </div>
                  </>
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Visual Chart 1: Confusion Matrix OR Actual vs Predicted */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>{isClassification ? 'Confusion Matrix' : 'Actual vs Predicted (Test Set)'}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {isClassification ? 'Actual vs Predicted Classes' : 'Regression Accuracy'}
                    </span>
                  </h3>

                  {isClassification && confusionMatrix ? (
                    <div className="overflow-x-auto flex flex-col items-center justify-center py-2">
                      <div className="inline-block border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <table className="text-xs text-center border-collapse">
                          <thead>
                            <tr className="bg-slate-100/80 text-slate-600">
                              <th className="p-2 border border-slate-200 text-[10px] font-bold">Actual \ Pred</th>
                              {confusionMatrix.labels.map(l => (
                                <th key={l} className="p-2 border border-slate-200 font-bold truncate max-w-[80px]" title={l}>
                                  {l}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {confusionMatrix.matrix.map((row, i) => (
                              <tr key={i}>
                                <td className="p-2 border border-slate-200 font-bold bg-slate-50 truncate max-w-[80px]" title={confusionMatrix.labels[i]}>
                                  {confusionMatrix.labels[i]}
                                </td>
                                {row.map((val, j) => {
                                  const isDiagonal = i === j;
                                  return (
                                    <td
                                      key={j}
                                      className={`p-2.5 border border-slate-200 font-bold ${
                                        isDiagonal
                                          ? val > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-400'
                                          : val > 0 ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-300'
                                      }`}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 text-center">
                        Green diagonal = correct predictions • Red = misclassifications
                      </p>
                    </div>
                  ) : actualVsPred.length > 0 ? (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={actualVsPred} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Actual" />
                          <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} name="Predicted" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No chart data available.</p>
                  )}
                </div>

                {/* Visual Chart 2: Feature Importance */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Feature Importance</span>
                    <span className="text-[10px] font-normal text-slate-500">Relative Feature Influence</span>
                  </h3>

                  {featureImportance.length > 0 ? (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featureImportance.slice(0, 7)}
                          layout="vertical"
                          margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis type="category" dataKey="feature" tick={{ fontSize: 10 }} stroke="#64748b" width={80} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                            {featureImportance.slice(0, 7).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#8b5cf6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                      Feature importances not applicable for this algorithm
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP LOGS */}
          {activeTab === 'steps' && (
            <div className="space-y-3">
              {result?.steps?.map((step, idx) => (
                <div
                  key={step.node_id || idx}
                  className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 font-sans text-xs">{step.step_name}</h4>
                      <span className="text-[10px] text-slate-400">{step.duration_ms} ms</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 font-sans">{step.message}</p>
                    {step.output && (
                      <pre className="mt-2 p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-700 overflow-x-auto max-h-28">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LIVE PREDICTION */}
          {activeTab === 'predict' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-1">Interactive Feature Inputs</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Supply test feature values to generate instant predictions using this model:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result?.model_metadata?.feature_info?.map(fi => (
                    <div key={fi.name}>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {fi.name} <span className="text-slate-400 font-normal">({fi.type})</span>
                      </label>
                      <input
                        type="text"
                        placeholder={fi.sample !== undefined ? `sample: ${fi.sample}` : ''}
                        value={testInputs[fi.name] || ''}
                        onChange={(e) => setTestInputs(prev => ({ ...prev, [fi.name]: e.target.value }))}
                        className="w-full text-xs rounded-lg border-slate-300 shadow-2xs p-2 border bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePredict}
                    disabled={predictLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {predictLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Calculate Prediction
                  </button>
                </div>
              </div>

              {prediction && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800">Generated Prediction</span>
                      <div className="text-2xl font-black text-emerald-950 mt-0.5">
                        {prediction.prediction}
                      </div>
                      {prediction.confidence && (
                        <div className="text-xs font-semibold text-emerald-700 mt-1">
                          Model Confidence: {prediction.confidence}%
                        </div>
                      )}
                    </div>
                    {prediction.probabilities && (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 text-xs">
                        <div className="font-bold text-slate-700 mb-1 text-[11px]">Class Probabilities:</div>
                        {Object.entries(prediction.probabilities).map(([cls, prob]) => (
                          <div key={cls} className="flex justify-between gap-4 text-[11px]">
                            <span className="text-slate-600 font-medium">{cls}:</span>
                            <span className="font-bold text-emerald-700">{prob}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Trained with real Scikit-learn algorithms on your dataset.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
