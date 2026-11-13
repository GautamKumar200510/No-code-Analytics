import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Database, FileSpreadsheet, Target } from 'lucide-react';

export default function DataLoaderNode({ id, data, selected }) {
  const datasetName = data?.dataset_id ? data.dataset_id.replace('sample_', '').replace(/_/g, ' ') : 'None selected';
  const targetCol = data?.target_column || 'Not set';

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Data Loading"
      subtitle="Input Dataset Source"
      iconName="Database"
      gradient="from-blue-600 to-indigo-600"
      hasInput={false}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> Dataset
          </span>
          <span className="font-semibold text-slate-800 capitalize truncate max-w-[120px]" title={datasetName}>
            {datasetName}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Target className="w-3.5 h-3.5 text-rose-500" /> Target
          </span>
          <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={targetCol}>
            {targetCol}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
