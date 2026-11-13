import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Sliders, Binary, Gauge } from 'lucide-react';

export default function PreprocessorNode({ id, data, selected }) {
  const encoding = data?.categorical_encoding || 'one_hot';
  const scaling = data?.scaling || 'standard';

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Data Preprocessing"
      subtitle="Encode & Scale"
      iconName="Sliders"
      gradient="from-indigo-500 to-indigo-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Binary className="w-3.5 h-3.5 text-indigo-500" /> Encoding
          </span>
          <span className="font-semibold text-slate-800 uppercase text-[10px] tracking-wide">
            {encoding.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" /> Scaling
          </span>
          <span className="font-semibold text-slate-800 capitalize">
            {scaling}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
