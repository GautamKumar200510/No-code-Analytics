import React from 'react';
import { 
  Play, RotateCcw, Save, Download, Maximize2, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

export default function WorkflowToolbar({
  isRunning,
  onRunWorkflow,
  onClearCanvas,
  onFitView,
  onSaveWorkflow,
  onExportWorkflow,
  validationErrors = [],
}) {
  const isValid = validationErrors.length === 0;

  return (
    <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shadow-xs">
      {/* Left: Validation indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isValid ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Ready
            </span>
          ) : (
            <span 
              className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium border border-amber-200 cursor-help"
              title={validationErrors.join('\n')}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              {validationErrors.length} Issue{validationErrors.length > 1 ? 's' : ''} to resolve
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFitView}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          title="Fit view to all nodes"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit View</span>
        </button>

        <button
          type="button"
          onClick={onSaveWorkflow}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          title="Save to local browser storage"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          type="button"
          onClick={onExportWorkflow}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          title="Download workflow JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          type="button"
          onClick={onClearCanvas}
          className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          title="Clear all nodes"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Primary Run Button */}
        <button
          type="button"
          onClick={onRunWorkflow}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Training Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Workflow</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
