import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Target, Award, Sparkles, RefreshCw, CheckCircle2, 
  ArrowRight, Download, Sliders, BarChart3, AlertCircle, ArrowLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Cell
} from 'recharts';
import { getDatasets, trainModel, getModelDownloadUrl } from '../services/api';

export default function TrainingPage({ onNavigate }) {
  const [datasets, setDatasets] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [problemType, setProblemType] = useState('classification');
  const [algorithm, setAlgorithm] = useState('random_forest');
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [hyperparams, setHyperparams] = useState({ n_estimators: 100, max_depth: null });

  // Execution State
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await getDatasets();
        if (res?.success && res.datasets.length > 0) {
          setDatasets(res.datasets);
          setSelectedDatasetId(res.datasets[0].id);
          const cols = res.datasets[0].column_names || [];
          setTargetColumn(cols[cols.length - 1] || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDatasets();
  }, []);

  const handleDatasetChange = (dsId) => {
    setSelectedDatasetId(dsId);
    const ds = datasets.find(d => d.id === dsId);
    if (ds && ds.column_names?.length > 0) {
      setTargetColumn(ds.column_names[ds.column_names.length - 1]);
    }
  };

  const handleTrain = async () => {
    if (!selectedDatasetId || !targetColumn) {
      setError("Please select both a dataset and target column.");
      return;
    }

    try {
      setTraining(true);
      setError(null);

      const payload = {
        dataset_id: selectedDatasetId,
        target_column: targetColumn,
        problem_type: problemType,
        algorithm: algorithm,
        test_size: testSize,
        random_state: randomState,
        hyperparams: hyperparams,
        preprocessing: {
          missing_values: { numerical_strategy: 'mean', categorical_strategy: 'mode' },
          categorical_encoding: 'one_hot',
          scaling: 'standard',
        }
      };

      const res = await trainModel(payload);
      if (res?.success) {
        setTrainResult(res.result);
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Model training failed.");
    } finally {
      setTraining(false);
    }
  };

  const selectedDsObj = datasets.find(d => d.id === selectedDatasetId);
  const isClassification = problemType === 'classification';
  const metrics = trainResult?.evaluation?.metrics || {};
  const cm = trainResult?.evaluation?.confusion_matrix;
  const featureImp = trainResult?.evaluation?.feature_importance || [];
  const actualVsPred = trainResult?.evaluation?.actual_vs_predicted || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-purple-600" />
          <span>Model Training Wizard</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          A step-by-step guided alternative to build, train, and benchmark Scikit-learn machine learning algorithms.
        </p>
      </div>

      {/* Stepper progress */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-semibold">
        {[
          { num: 1, label: 'Data & Target' },
          { num: 2, label: 'Model Type' },
          { num: 3, label: 'Split & Params' },
          { num: 4, label: 'Train & Results' }
        ].map(step => (
          <div
            key={step.num}
            onClick={() => { if (step.num < 4 || trainResult) setCurrentStep(step.num); }}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              currentStep === step.num
                ? 'text-purple-600 font-bold'
                : currentStep > step.num
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === step.num
                ? 'bg-purple-600 text-white'
                : currentStep > step.num
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Wizard Steps Content */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800">Step 1: Select Dataset & Prediction Target</h3>
            <p className="text-xs text-slate-500">Pick which dataset to train on and which variable the model will predict.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 border bg-white focus:ring-purple-500"
                >
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.rows} rows, {ds.columns} cols)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Column</label>
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full text-xs rounded-xl border-slate-300 p-2.5 border bg-white focus:ring-purple-500"
                >
                  {selectedDsObj?.column_names?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Choose Algorithm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800">Step 2: Choose Problem Type & Algorithm</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Problem Category</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setProblemType('classification');
                    setAlgorithm('random_forest');
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    problemType === 'classification'
                      ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Classification</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Categorical / discrete target classes</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProblemType('regression');
                    setAlgorithm('linear_regression');
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    problemType === 'regression'
                      ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Regression</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Continuous numeric values</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Algorithm</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isClassification
                  ? [
                      { id: 'random_forest', name: 'Random Forest Classifier', desc: 'Ensemble of decision trees. High accuracy & handles non-linearities.' },
                      { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Linear decision boundary with class probabilities.' },
                      { id: 'decision_tree', name: 'Decision Tree Classifier', desc: 'Flowchart rules based on Gini/entropy splits.' },
                      { id: 'knn', name: 'K-Nearest Neighbors (KNN)', desc: 'Classifies based on nearest distance neighbors.' },
                      { id: 'svm', name: 'Support Vector Machine (SVM)', desc: 'Finds optimal hyperplane with maximal margins.' },
                    ]
                  : [
                      { id: 'linear_regression', name: 'Linear Regression', desc: 'Classic baseline fitting best-fit hyperplanes.' },
                      { id: 'random_forest', name: 'Random Forest Regressor', desc: 'Bagged tree ensemble for smooth continuous predictions.' },
                      { id: 'decision_tree', name: 'Decision Tree Regressor', desc: 'Step-wise constant decision boundaries.' },
                      { id: 'knn', name: 'K-Nearest Neighbors Regressor', desc: 'Predicts average of k nearest neighbours.' },
                      { id: 'svm', name: 'Support Vector Regressor (SVR)', desc: 'Margin-based error threshold regression.' },
                    ]
                ).map(item => (
                  <div
                    key={item.id}
                    onClick={() => setAlgorithm(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      algorithm === item.id
                        ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-100 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Hyperparameters</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800">Step 3: Train-Test Split & Hyperparameters</h3>

            {/* Train test split slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Holdout Testing Ratio</span>
                <span className="text-purple-600">{Math.round(testSize * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={testSize}
                onChange={(e) => setTestSize(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Training: {Math.round((1 - testSize) * 100)}%</span>
                <span>Testing: {Math.round(testSize * 100)}%</span>
              </div>
            </div>

            {/* Hyperparameters */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Model Parameters
              </span>

              {algorithm === 'random_forest' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Number of Estimators (Trees)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={hyperparams.n_estimators || 100}
                    onChange={(e) => setHyperparams({ ...hyperparams, n_estimators: parseInt(e.target.value) || 100 })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white"
                  />
                </div>
              )}

              {algorithm === 'knn' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Neighbors (k)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={hyperparams.n_neighbors || 5}
                    onChange={(e) => setHyperparams({ ...hyperparams, n_neighbors: parseInt(e.target.value) || 5 })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white"
                  />
                </div>
              )}

              {(algorithm === 'svm' || algorithm === 'logistic_regression') && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Regularization Strength (C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hyperparams.C || 1.0}
                    onChange={(e) => setHyperparams({ ...hyperparams, C: parseFloat(e.target.value) || 1.0 })}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleTrain}
                disabled={training}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {training ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{training ? 'Training Model...' : 'Train Model Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {currentStep === 4 && trainResult && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Model Trained Successfully ✓
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {trainResult.metadata?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Model ID: {trainResult.model_id} • Duration: {trainResult.metadata?.training_time_ms} ms
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getModelDownloadUrl(trainResult.model_id)}
                  download
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .joblib</span>
                </a>
                <button
                  onClick={() => onNavigate('predictions')}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Test</span>
                </button>
              </div>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isClassification ? (
                <>
                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Test Accuracy</span>
                    <div className="text-2xl font-black text-blue-950 mt-0.5">{metrics.accuracy}%</div>
                    <span className="text-[10px] text-blue-500">Train: {metrics.train_accuracy}%</span>
                  </div>
                  <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Precision</span>
                    <div className="text-2xl font-black text-purple-950 mt-0.5">{metrics.precision}%</div>
                    <span className="text-[10px] text-purple-500">Weighted avg</span>
                  </div>
                  <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Recall</span>
                    <div className="text-2xl font-black text-indigo-950 mt-0.5">{metrics.recall}%</div>
                    <span className="text-[10px] text-indigo-500">True positive rate</span>
                  </div>
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">F1-Score</span>
                    <div className="text-2xl font-black text-emerald-950 mt-0.5">{metrics.f1_score}%</div>
                    <span className="text-[10px] text-emerald-500">Harmonic balance</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">R² Score</span>
                    <div className="text-2xl font-black text-blue-950 mt-0.5">{metrics.r2_score}</div>
                    <span className="text-[10px] text-blue-500">Train R²: {metrics.train_r2}</span>
                  </div>
                  <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 uppercase">MAE</span>
                    <div className="text-2xl font-black text-purple-950 mt-0.5">{metrics.mae}</div>
                    <span className="text-[10px] text-purple-500">Mean Absolute Error</span>
                  </div>
                  <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">RMSE</span>
                    <div className="text-2xl font-black text-indigo-950 mt-0.5">{metrics.rmse}</div>
                    <span className="text-[10px] text-indigo-500">Root Mean Squared</span>
                  </div>
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">MSE</span>
                    <div className="text-2xl font-black text-amber-950 mt-0.5">{metrics.mse}</div>
                    <span className="text-[10px] text-amber-500">Mean Squared Error</span>
                  </div>
                </>
              )}
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Chart 1 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  {isClassification ? 'Confusion Matrix' : 'Actual vs Predicted'}
                </h4>
                {isClassification && cm ? (
                  <div className="overflow-x-auto py-2 flex justify-center">
                    <table className="text-xs text-center border-collapse border border-slate-200 bg-white">
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
                  <div className="h-44 w-full">
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

              {/* Chart 2: Feature Importance */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Feature Importance</h4>
                {featureImp.length > 0 ? (
                  <div className="h-44 w-full">
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
                  <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                    Not applicable for this model
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                ← Train Another Model
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
