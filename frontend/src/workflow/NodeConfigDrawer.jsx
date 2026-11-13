import React, { useState, useEffect } from 'react';
import { 
  X, Check, Database, Sliders, AlertCircle, CheckSquare, Split, Cpu, 
  Zap, BarChart3, Sparkles, HelpCircle, RefreshCw
} from 'lucide-react';
import { getDatasets, getDatasetDetails, predictModel } from '../services/api';

export default function NodeConfigDrawer({ node, onClose, onUpdateNodeData }) {
  if (!node) return null;

  const [formData, setFormData] = useState({ ...(node.data || {}) });
  const [datasets, setDatasets] = useState([]);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [predictInputs, setPredictInputs] = useState({});

  useEffect(() => {
    setFormData({ ...(node.data || {}) });
  }, [node]);

  useEffect(() => {
    if (node.type === 'dataLoader' || node.type === 'featureSelector') {
      loadDatasetsList();
    }
  }, [node.type]);

  const loadDatasetsList = async () => {
    try {
      setLoadingDatasets(true);
      const res = await getDatasets();
      if (res.success) {
        setDatasets(res.datasets);
        // If dataLoader has dataset_id, fetch details
        const dsId = node.data?.dataset_id || res.datasets[0]?.id;
        if (dsId) {
          fetchDetails(dsId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const fetchDetails = async (dsId) => {
    try {
      const res = await getDatasetDetails(dsId);
      if (res.success) {
        setDatasetDetails(res.details);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDatasetChange = (dsId) => {
    handleChange('dataset_id', dsId);
    fetchDetails(dsId);
  };

  const handleSave = () => {
    onUpdateNodeData(node.id, formData);
    onClose();
  };

  const handleRunPrediction = async () => {
    const modelId = node.data?.model_id || formData.model_id;
    if (!modelId) {
      alert("No trained model available yet. Please run the workflow first!");
      return;
    }
    try {
      setPredictLoading(true);
      const res = await predictModel(modelId, predictInputs);
      if (res.success) {
        setPredictResult(res.prediction);
        handleChange('lastPrediction', res.prediction.prediction);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            Configure Node: <span className="text-blue-600 capitalize">{node.type}</span>
          </h3>
          <p className="text-xs text-slate-500 font-mono">ID: {node.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* DATA LOADER */}
        {node.type === 'dataLoader' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Dataset
              </label>
              <select
                value={formData.dataset_id || ''}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
              >
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.rows} rows, {ds.columns} cols)
                  </option>
                ))}
              </select>
            </div>

            {datasetDetails && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target (Prediction Column)
                </label>
                <select
                  value={formData.target_column || ''}
                  onChange={(e) => handleChange('target_column', e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                >
                  <option value="">-- Choose Target Column --</option>
                  {datasetDetails.columns_info?.map(col => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  The target is the variable you want the ML model to predict.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MISSING VALUE HANDLER */}
        {node.type === 'missingValueHandler' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numerical Columns Strategy
              </label>
              <select
                value={formData.numerical_strategy || 'mean'}
                onChange={(e) => handleChange('numerical_strategy', e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 border bg-white"
              >
                <option value="mean">Impute with Mean (Average)</option>
                <option value="median">Impute with Median (Middle value)</option>
                <option value="zero">Fill with Zero (0)</option>
                <option value="drop_row">Drop Rows with Missing Values</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categorical Columns Strategy
              </label>
              <select
                value={formData.categorical_strategy || 'mode'}
                onChange={(e) => handleChange('categorical_strategy', e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 border bg-white"
              >
                <option value="mode">Impute with Mode (Most Frequent)</option>
                <option value="unknown">Fill with 'Unknown' tag</option>
                <option value="drop_row">Drop Rows with Missing Values</option>
              </select>
            </div>
          </div>
        )}

        {/* PREPROCESSOR */}
        {node.type === 'preprocessor' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categorical Encoding
              </label>
              <select
                value={formData.categorical_encoding || 'one_hot'}
                onChange={(e) => handleChange('categorical_encoding', e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              >
                <option value="one_hot">One-Hot Encoding (Creates binary columns)</option>
                <option value="label">Label Encoding (Converts to integers 0, 1, 2...)</option>
                <option value="none">None (Keep as is)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feature Scaling
              </label>
              <select
                value={formData.scaling || 'standard'}
                onChange={(e) => handleChange('scaling', e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              >
                <option value="standard">StandardScaler (Mean=0, Std=1)</option>
                <option value="minmax">MinMaxScaler (Scales between 0 and 1)</option>
                <option value="none">None (Raw values)</option>
              </select>
            </div>
          </div>
        )}

        {/* TRAIN TEST SPLIT */}
        {node.type === 'trainTestSplit' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Testing Data Ratio</span>
                <span className="text-cyan-600 font-bold">{Math.round((formData.test_size || 0.2) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={formData.test_size || 0.2}
                onChange={(e) => handleChange('test_size', parseFloat(e.target.value))}
                className="w-full accent-cyan-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Train: {Math.round((1 - (formData.test_size || 0.2)) * 100)}%</span>
                <span>Test: {Math.round((formData.test_size || 0.2) * 100)}%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Random State (Seed)
              </label>
              <input
                type="number"
                value={formData.random_state ?? 42}
                onChange={(e) => handleChange('random_state', parseInt(e.target.value) || 0)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 border bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ensures reproducible train and test splits every time you run.
              </p>
            </div>
          </div>
        )}

        {/* MODEL SELECTOR */}
        {node.type === 'modelSelector' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Problem Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('problem_type', 'classification');
                    handleChange('algorithm', 'random_forest');
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    (formData.problem_type || 'classification') === 'classification'
                      ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Classification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('problem_type', 'regression');
                    handleChange('algorithm', 'linear_regression');
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    formData.problem_type === 'regression'
                      ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Regression
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Machine Learning Algorithm
              </label>
              <select
                value={formData.algorithm || ((formData.problem_type || 'classification') === 'classification' ? 'random_forest' : 'linear_regression')}
                onChange={(e) => handleChange('algorithm', e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border bg-white"
              >
                {(formData.problem_type || 'classification') === 'classification' ? (
                  <>
                    <option value="random_forest">Random Forest Classifier</option>
                    <option value="logistic_regression">Logistic Regression</option>
                    <option value="decision_tree">Decision Tree Classifier</option>
                    <option value="knn">K-Nearest Neighbors (KNN)</option>
                    <option value="svm">Support Vector Machine (SVM)</option>
                  </>
                ) : (
                  <>
                    <option value="linear_regression">Linear Regression</option>
                    <option value="random_forest">Random Forest Regressor</option>
                    <option value="decision_tree">Decision Tree Regressor</option>
                    <option value="knn">K-Nearest Neighbors Regressor</option>
                    <option value="svm">Support Vector Regressor (SVR)</option>
                  </>
                )}
              </select>
            </div>

            {/* Hyperparameters */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Hyperparameters
              </span>

              {(formData.algorithm === 'random_forest') && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Number of Trees (n_estimators)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formData.hyperparams?.n_estimators || 100}
                    onChange={(e) => handleChange('hyperparams', { ...(formData.hyperparams || {}), n_estimators: parseInt(e.target.value) || 100 })}
                    className="w-full text-xs rounded border-slate-300 p-1.5 border"
                  />
                </div>
              )}

              {(formData.algorithm === 'decision_tree' || formData.algorithm === 'random_forest') && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Max Depth (leave empty for unlimited)</label>
                  <input
                    type="number"
                    placeholder="None"
                    value={formData.hyperparams?.max_depth || ''}
                    onChange={(e) => handleChange('hyperparams', { ...(formData.hyperparams || {}), max_depth: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full text-xs rounded border-slate-300 p-1.5 border"
                  />
                </div>
              )}

              {formData.algorithm === 'knn' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Neighbors (k)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.hyperparams?.n_neighbors || 5}
                    onChange={(e) => handleChange('hyperparams', { ...(formData.hyperparams || {}), n_neighbors: parseInt(e.target.value) || 5 })}
                    className="w-full text-xs rounded border-slate-300 p-1.5 border"
                  />
                </div>
              )}

              {(formData.algorithm === 'svm' || formData.algorithm === 'logistic_regression') && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Regularization (C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={formData.hyperparams?.C || 1.0}
                    onChange={(e) => handleChange('hyperparams', { ...(formData.hyperparams || {}), C: parseFloat(e.target.value) || 1.0 })}
                    className="w-full text-xs rounded border-slate-300 p-1.5 border"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODEL TRAINER */}
        {node.type === 'modelTrainer' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              This node compiles all prior configuration, preprocesses the data, splits into training/testing, and fits the chosen ML algorithm.
            </p>
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-orange-800 text-xs">
              ⚡ To train this node, connect your pipeline and click <strong>"Run Workflow"</strong> in the top toolbar!
            </div>
          </div>
        )}

        {/* MODEL EVALUATOR */}
        {node.type === 'modelEvaluator' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Evaluates the trained model against holdout test data and computes accuracy, precision, recall, F1, or R² and MSE.
            </p>
            {node.data?.metrics ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700">Latest Metrics:</span>
                {Object.entries(node.data.metrics).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No evaluation results yet. Click "Run Workflow" to calculate.</p>
            )}
          </div>
        )}

        {/* PREDICTOR */}
        {node.type === 'predictor' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Test real-time predictions by entering sample values for each feature:
            </p>

            {node.data?.feature_info && node.data.feature_info.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {node.data.feature_info.map(fi => (
                  <div key={fi.name}>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      {fi.name} <span className="text-[10px] text-slate-400">({fi.type})</span>
                    </label>
                    <input
                      type="text"
                      placeholder={fi.mean ? `avg: ${Math.round(fi.mean * 100) / 100}` : 'value'}
                      value={predictInputs[fi.name] || ''}
                      onChange={(e) => setPredictInputs(prev => ({ ...prev, [fi.name]: e.target.value }))}
                      className="w-full text-xs rounded border-slate-300 p-1.5 border"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-pink-50 p-2.5 rounded-lg border border-pink-100">
                Run the workflow first to initialize the trained model's feature schema.
              </p>
            )}

            <button
              type="button"
              onClick={handleRunPrediction}
              disabled={predictLoading || !node.data?.model_id}
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg text-xs font-semibold shadow hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {predictLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Prediction
            </button>

            {predictResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 mt-2">
                <div className="text-[11px] text-emerald-700 font-medium">Prediction Result:</div>
                <div className="text-lg font-bold mt-0.5">{predictResult.prediction}</div>
                {predictResult.confidence && (
                  <div className="text-xs text-emerald-600 mt-1">Confidence: {predictResult.confidence}%</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Save Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Apply Changes
        </button>
      </div>
    </div>
  );
}
