import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { AlertCircle, Hash, Tag } from 'lucide-react';

export default function MissingValueNode({ id, data, selected }) {
  const numStrategy = data?.numerical_strategy || 'mean';
  const catStrategy = data?.categorical_strategy || 'mode';

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Handle Missing Values"
      subtitle="Clean & Impute Data"
      iconName="AlertCircle"
      gradient="from-amber-500 to-amber-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Hash className="w-3.5 h-3.5 text-amber-500" /> Numerical
          </span>
          <span className="font-semibold text-slate-800 capitalize">
            {numStrategy}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Tag className="w-3.5 h-3.5 text-amber-500" /> Categorical
          </span>
          <span className="font-semibold text-slate-800 capitalize">
            {catStrategy}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
