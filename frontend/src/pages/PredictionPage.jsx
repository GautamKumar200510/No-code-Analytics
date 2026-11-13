import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Cpu, RefreshCw, CheckCircle2, AlertCircle, 
  RotateCcw, Sliders, ArrowRight, Layers, HelpCircle
} from 'lucide-react';
import { getModels, getModelDetails, predictModel } from '../services/api';

export default function PredictionPage({ onNavigate }) {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [modelDetails, setModelDetails] = useState(null);
  const [inputs, setInputs] = useState({});
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModelsList = async () => {
      try {
        setLoadingModels(true);
        const res = await getModels();
        if (res?.success) {
          setModels(res.models);
          if (res.models.length > 0) {
            setSelectedModelId(res.models[0].model_id);
            loadModel(res.models[0].model_id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModelsList();
  }, []);

  const loadModel = async (mid) => {
    try {
      setLoadingDetails(true);
      setError(null);
      setPredictionResult(null);
      setSelectedModelId(mid);
      const res = await getModelDetails(mid);
      if (res?.success) {
        setModelDetails(res.model);
        // Pre-fill inputs with sample or mean values
        const initialInputs = {};
        res.model.feature_info?.forEach(fi => {
          initialInputs[fi.name] = fi.sample !== undefined ? fi.sample : (fi.mean !== undefined ? fi.mean : '');
        });
        setInputs(initialInputs);
      }
    } catch (err) {
      setError("Failed to load model details: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInputChange = (feat, val) => {
    setInputs(prev => ({ ...prev, [feat]: val }));
  };

  const handleFillDefaults = () => {
    if (!modelDetails) return;
    const initialInputs = {};
    modelDetails.feature_info?.forEach(fi => {
      initialInputs[fi.name] = fi.sample !== undefined ? fi.sample : (fi.mean !== undefined ? Math.round(fi.mean * 100) / 100 : '');
    });
    setInputs(initialInputs);
  };

  const handleResetInputs = () => {
    const empty = {};
    modelDetails?.feature_names?.forEach(f => {
      empty[f] = '';
    });
    setInputs(empty);
    setPredictionResult(null);
  };

  const handlePredict = async () => {
    if (!selectedModelId) return;

    try {
      setPredicting(true);
      setError(null);
      const res = await predictModel(selectedModelId, inputs);
      if (res?.success) {
        setPredictionResult(res.prediction);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-pink-500" />
          <span>Interactive Live Predictions</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select any trained machine learning model, supply input features, and test live predictions instantly.
        </p>
      </div>

      {models.length === 0 && !loadingModels ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Trained Models Found</h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            You need to train a model first using the Visual Workflow Builder or the Training Wizard before you can generate predictions.
          </p>
          <button
            onClick={() => onNavigate('builder')}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all cursor-pointer"
          >
            Go to Visual Workflow Builder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Model Selector & Feature Inputs */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            {/* Model Selector Bar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose Trained ML Model
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => loadModel(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border-slate-300 p-2.5 border bg-white focus:ring-pink-500 text-slate-800"
              >
                {models.map(md => (
                  <option key={md.model_id} value={md.model_id}>
                    {md.algorithm_name || md.algorithm} on '{md.target_column}' ({md.problem_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Model Spec Badge */}
            {modelDetails && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{modelDetails.algorithm_name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {modelDetails.problem_type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Target: <span className="font-bold text-slate-700">{modelDetails.target_column}</span>
                </div>
              </div>
            )}

            {/* Inputs Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Model Input Features ({modelDetails?.feature_names?.length || 0})
                </h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleFillDefaults}
                    className="text-pink-600 hover:text-pink-700 font-semibold cursor-pointer"
                  >
                    Use Sample Values
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleResetInputs}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of feature inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {modelDetails?.feature_info?.map(fi => (
                  <div key={fi.name} className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 truncate" title={fi.name}>
                      {fi.name}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">({fi.type})</span>
                    </label>
                    <input
                      type="text"
                      value={inputs[fi.name] !== undefined ? inputs[fi.name] : ''}
                      onChange={(e) => handleInputChange(fi.name, e.target.value)}
                      placeholder={fi.mean ? `avg: ${Math.round(fi.mean * 100) / 100}` : 'value'}
                      className="w-full text-xs rounded-lg border-slate-300 bg-white p-2 border shadow-2xs focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Predict Button */}
            <button
              type="button"
              onClick={handlePredict}
              disabled={predicting || !selectedModelId}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{predicting ? 'Calculating Prediction...' : 'Generate Prediction'}</span>
            </button>
          </div>

          {/* Right Card: Result Outcome */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" /> Prediction Output
              </h3>

              {predictionResult ? (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Predicted Value
                    </span>
                    <div className="text-3xl font-black text-emerald-950 mt-1 break-words">
                      {predictionResult.prediction}
                    </div>
                    {predictionResult.confidence && (
                      <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-xs font-bold">
                        {predictionResult.confidence}% Confidence
                      </div>
                    )}
                  </div>

                  {/* Probabilities breakdown */}
                  {predictionResult.probabilities && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700">Class Probability Distribution:</span>
                      <div className="space-y-2">
                        {Object.entries(predictionResult.probabilities).map(([cls, prob]) => (
                          <div key={cls} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                              <span>{cls}</span>
                              <span className="font-bold text-slate-800">{prob}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {predictionResult.defaulted_features?.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                      <strong>Note:</strong> Used dataset average for omitted inputs: {predictionResult.defaulted_features.join(', ')}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Click "Generate Prediction" to compute real-time inferences.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Predictions run directly through fitted Scikit-learn pipelines in the Python backend.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
