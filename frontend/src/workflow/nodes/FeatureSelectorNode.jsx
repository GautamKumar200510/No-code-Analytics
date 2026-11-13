import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { CheckSquare, ListFilter } from 'lucide-react';

export default function FeatureSelectorNode({ id, data, selected }) {
  const selectedCount = data?.selected_features?.length || 0;

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Feature Selection"
      subtitle="Feature Filtering"
      iconName="CheckSquare"
      gradient="from-emerald-500 to-emerald-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
          <ListFilter className="w-3.5 h-3.5 text-emerald-500" /> Active
        </span>
        <span className="font-semibold text-slate-800">
          {selectedCount > 0 ? `${selectedCount} columns` : 'All features'}
        </span>
      </div>
    </CustomNodeWrapper>
  );
}
