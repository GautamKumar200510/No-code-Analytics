import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Database, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Search, Sliders, ArrowRight, Table, Layers, BarChart, Sparkles, Loader2, Target
} from 'lucide-react';
import { getDatasets, getDatasetDetails, uploadDataset } from '../services/api';

export default function DatasetsPage({ onNavigate, onSelectDatasetForWorkflow }) {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [searchPreview, setSearchPreview] = useState('');
  const [selectedTargetCol, setSelectedTargetCol] = useState('');
  const fileInputRef = useRef(null);

  const fetchDatasetsList = async (preferredId = null) => {
    try {
      const res = await getDatasets();
      if (res?.success) {
        setDatasets(res.datasets);
        const targetId = preferredId || selectedDatasetId || res.datasets[0]?.id;
        if (targetId) {
          loadDatasetDetails(targetId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasetsList();
  }, []);

  const loadDatasetDetails = async (id) => {
    try {
      setLoading(true);
      setSelectedDatasetId(id);
      const res = await getDatasetDetails(id);
      if (res?.success) {
        setDatasetDetails(res.details);
        // Default target column to last column
        if (res.details.columns_info?.length > 0) {
          const lastCol = res.details.columns_info[res.details.columns_info.length - 1].name;
          setSelectedTargetCol(lastCol);
        }
      }
    } catch (err) {
      console.error("Failed to load dataset details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError("Invalid file type. Please upload a standard comma-separated .CSV file.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const res = await uploadDataset(file);
      if (res?.success) {
        setUploadSuccess(`Successfully uploaded '${file.name}'!`);
        await fetchDatasetsList(res.dataset.id);
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleOpenInCanvas = () => {
    if (!selectedDatasetId) return;
    if (onSelectDatasetForWorkflow) {
      onSelectDatasetForWorkflow(selectedDatasetId, selectedTargetCol);
    }
    onNavigate('builder');
  };

  const filteredPreview = datasetDetails?.preview?.filter(row => {
    if (!searchPreview) return true;
    return Object.values(row).some(v => 
      String(v).toLowerCase().includes(searchPreview.toLowerCase())
    );
  }) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            <span>Dataset Management & Preview</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload CSV files, examine feature schemas, detect missing values, and select prediction targets.
          </p>
        </div>

        {selectedDatasetId && (
          <button
            onClick={handleOpenInCanvas}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Use in Visual Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Upload Zone & Dataset Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Upload New Dataset (CSV)
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/40 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />
            {uploading ? (
              <div className="py-2 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <span className="text-xs font-semibold text-slate-700">Uploading and inspecting dataset...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Drop CSV file here or <span className="text-blue-600">browse</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports comma-delimited tabular CSV files up to 25 MB
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Available Datasets List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Datasets ({datasets.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click to preview details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {datasets.map(ds => {
              const isSelected = ds.id === selectedDatasetId;
              return (
                <div
                  key={ds.id}
                  onClick={() => loadDatasetDetails(ds.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-2xs ring-2 ring-blue-100'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-800 capitalize truncate" title={ds.name}>
                        {ds.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {ds.rows} rows • {ds.columns} cols • {ds.size_kb} KB
                      </p>
                    </div>
                  </div>

                  {ds.is_sample && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex-shrink-0">
                      Sample
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dataset Details Inspector */}
      {loading ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-600">Inspecting dataset statistics and schemas...</span>
        </div>
      ) : datasetDetails ? (
        <div className="space-y-6">
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Rows</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{datasetDetails.rows}</div>
              <span className="text-[10px] text-slate-400">Sample instances</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Columns</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{datasetDetails.columns}</div>
              <span className="text-[10px] text-slate-400">Input features + target</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Missing Cells</span>
              <div className={`text-2xl font-black mt-0.5 ${datasetDetails.total_missing > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {datasetDetails.total_missing}
              </div>
              <span className="text-[10px] text-slate-400">
                {datasetDetails.total_missing > 0 ? 'Cleaning recommended' : 'Zero nulls found ✓'}
              </span>
            </div>

            {/* Target Column Selector Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-4 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600" /> Target Column
              </span>
              <select
                value={selectedTargetCol}
                onChange={(e) => setSelectedTargetCol(e.target.value)}
                className="w-full text-xs font-bold rounded-lg border-blue-300 bg-white p-1.5 border mt-1 shadow-2xs focus:ring-blue-500 text-slate-800"
              >
                {datasetDetails.columns_info?.map(col => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-blue-600 mt-0.5 block">Variable for model to predict</span>
            </div>
          </div>

          {/* Column Schema Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-500" /> Column Schema & Missing Analysis
              </h3>
              <span className="text-xs text-slate-500">
                {datasetDetails.columns_info?.length} features detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-bold">Column Name</th>
                    <th className="p-3 font-bold">Data Type</th>
                    <th className="p-3 font-bold">Missing Values</th>
                    <th className="p-3 font-bold">Missing %</th>
                    <th className="p-3 font-bold">Distinct Values</th>
                    <th className="p-3 font-bold">Sample Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {datasetDetails.columns_info?.map(col => {
                    const isTarget = col.name === selectedTargetCol;
                    return (
                      <tr key={col.name} className={`hover:bg-slate-50/80 transition-colors ${isTarget ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          {isTarget && <Target className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{col.name}</span>
                          {isTarget && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                              Target
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            col.type === 'numerical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {col.type} ({col.raw_dtype})
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className={col.null_count > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                            {col.null_count}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className={col.null_percentage > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                            {col.null_percentage}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{col.unique_count}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                          {col.sample_values?.join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dataset Preview Rows */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Dataset Preview (First 20 Rows)
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter preview rows..."
                  value={searchPreview}
                  onChange={(e) => setSearchPreview(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2.5 font-bold">#</th>
                    {datasetDetails.columns_info?.map(c => (
                      <th key={c.name} className="p-2.5 font-bold truncate max-w-xs">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreview.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                      {datasetDetails.columns_info?.map(c => {
                        const val = row[c.name];
                        return (
                          <td key={c.name} className="p-2.5 font-mono text-[11px]">
                            {val === null || val === undefined ? (
                              <span className="text-rose-500 italic">null</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
