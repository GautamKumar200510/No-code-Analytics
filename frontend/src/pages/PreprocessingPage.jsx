import React, { useState, useEffect } from 'react';
import { 
  Sliders, Database, Binary, Gauge, AlertCircle, CheckCircle2, 
  ArrowRight, RefreshCw, Sparkles, Layers, FileSpreadsheet
} from 'lucide-react';
import { getDatasets, preprocessData } from '../services/api';

export default function PreprocessingPage({ onNavigate }) {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [targetColumn, setTargetColumn] = useState('');

  // Configurations
  const [numStrategy, setNumStrategy] = useState('mean');
  const [catStrategy, setCatStrategy] = useState('mode');
  const [catEncoding, setCatEncoding] = useState('one_hot');
  const [scaling, setScaling] = useState('standard');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await getDatasets();
        if (res?.success) {
          setDatasets(res.datasets);
          if (res.datasets.length > 0) {
            setSelectedDatasetId(res.datasets[0].id);
            setTargetColumn(res.datasets[0].column_names[res.datasets[0].column_names.length - 1] || '');
          }
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
    setResult(null);
  };

  const handleRunPreprocessing = async () => {
    if (!selectedDatasetId) return;

    try {
      setLoading(true);
      setError(null);
      const config = {
        target_column: targetColumn,
        missing_values: {
          numerical_strategy: numStrategy,
          categorical_strategy: catStrategy,
        },
        categorical_encoding: catEncoding,
        scaling: scaling,
      };

      const res = await preprocessData(selectedDatasetId, config);
      if (res?.success) {
        setResult(res.summary);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Preprocessing failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectedDsObj = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-indigo-600" />
          <span>Data Preprocessing & Transformation</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure missing value imputation, one-hot categorical encoding, and feature standardization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" /> Preprocessing Controls
          </h3>

          {/* Dataset selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Dataset</label>
            <select
              value={selectedDatasetId}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white focus:ring-indigo-500"
            >
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.rows} rows, {ds.columns} cols)
                </option>
              ))}
            </select>
          </div>

          {/* Target column protection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Column (Will Not Be Scaled)</label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white focus:ring-indigo-500"
            >
              <option value="">-- No target (clean all) --</option>
              {selectedDsObj?.column_names?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Missing value strategies */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              1. Missing Value Imputation
            </span>

            <div>
              <label className="block text-[11px] font-medium text-amber-800 mb-1">Numerical Strategy</label>
              <select
                value={numStrategy}
                onChange={(e) => setNumStrategy(e.target.value)}
                className="w-full text-xs rounded-lg border-amber-300 bg-white p-1.5 border"
              >
                <option value="mean">Mean (Average)</option>
                <option value="median">Median (Middle value)</option>
                <option value="zero">Fill with 0</option>
                <option value="drop_row">Drop Rows with Missing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-amber-800 mb-1">Categorical Strategy</label>
              <select
                value={catStrategy}
                onChange={(e) => setCatStrategy(e.target.value)}
                className="w-full text-xs rounded-lg border-amber-300 bg-white p-1.5 border"
              >
                <option value="mode">Mode (Most Frequent)</option>
                <option value="unknown">Fill with 'Unknown'</option>
                <option value="drop_row">Drop Rows with Missing</option>
              </select>
            </div>
          </div>

          {/* Encoding & Scaling */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-3">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              2. Encoding & Scaling
            </span>

            <div>
              <label className="block text-[11px] font-medium text-indigo-800 mb-1">Categorical Encoding</label>
              <select
                value={catEncoding}
                onChange={(e) => setCatEncoding(e.target.value)}
                className="w-full text-xs rounded-lg border-indigo-300 bg-white p-1.5 border"
              >
                <option value="one_hot">One-Hot Encoding (pd.get_dummies)</option>
                <option value="label">Label Encoding (0, 1, 2...)</option>
                <option value="none">None (Keep raw)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-indigo-800 mb-1">Numerical Scaling</label>
              <select
                value={scaling}
                onChange={(e) => setScaling(e.target.value)}
                className="w-full text-xs rounded-lg border-indigo-300 bg-white p-1.5 border"
              >
                <option value="standard">StandardScaler (Mean=0, Std=1)</option>
                <option value="minmax">MinMaxScaler (0 to 1)</option>
                <option value="none">None (Raw values)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleRunPreprocessing}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Execute Preprocessing</span>
          </button>
        </div>

        {/* Right: Results Preview & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Before vs After Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Rows</span>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    {result.initial_shape[0]} → <span className="text-blue-600">{result.final_shape[0]}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Sample count</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Columns</span>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    {result.initial_shape[1]} → <span className="text-indigo-600">{result.final_shape[1]}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Total feature count</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Encoding</span>
                  <div className="text-sm font-bold text-slate-800 mt-1 capitalize">
                    {catEncoding.replace('_', ' ')}
                  </div>
                  <span className="text-[10px] text-slate-400">Applied</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Scaling</span>
                  <div className="text-sm font-bold text-slate-800 mt-1 capitalize">
                    {scaling}
                  </div>
                  <span className="text-[10px] text-slate-400">Transform applied</span>
                </div>
              </div>

              {/* Execution Steps Log */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Transformation Steps Executed:
                </h4>
                <div className="space-y-1.5">
                  {result.log_steps?.map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cleaned Dataset Preview Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Processed Dataset Preview (Head 20 Rows)
                  </h3>
                  <button
                    onClick={() => onNavigate('builder')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Build Pipeline in Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="p-2.5 font-bold">#</th>
                        {result.column_names?.map(c => (
                          <th key={c} className="p-2.5 font-bold truncate max-w-xs">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.preview?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                          {result.column_names?.map(c => (
                            <td key={c} className="p-2.5 font-mono text-[11px]">
                              {typeof row[c] === 'number' ? Math.round(row[c] * 1000) / 1000 : String(row[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Ready to Preprocess Data</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Choose your imputation methods and scaling options on the left, then click "Execute Preprocessing" to test your transformations with real Python backend calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
