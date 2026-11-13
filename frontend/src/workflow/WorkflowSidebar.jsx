import React, { useState } from 'react';
import { 
  Database, Sliders, AlertCircle, CheckSquare, Split, Cpu, Zap, 
  BarChart3, Sparkles, Search, Layers, LayoutTemplate, HelpCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { NODE_TYPES_DEF, WORKFLOW_TEMPLATES } from './templates';

const ICON_MAP = {
  Database,
  Sliders,
  AlertCircle,
  CheckSquare,
  Split,
  Cpu,
  Zap,
  BarChart3,
  Sparkles,
};

export default function WorkflowSidebar({ onLoadTemplate }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('nodes'); // 'nodes' | 'templates'
  const [expandedCategories, setExpandedCategories] = useState({
    'Data Source': true,
    'Preprocessing': true,
    'Feature Engineering': true,
    'Preparation': true,
    'Model': true,
    'Evaluation': true,
    'Inference': true,
  });

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Group nodes by category
  const filteredNodes = NODE_TYPES_DEF.filter(n => 
    n.label.toLowerCase().includes(search.toLowerCase()) || 
    n.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(filteredNodes.map(n => n.category)));

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full select-none z-10 shadow-sm">
      {/* Header Tabs */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'nodes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Blocks
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'templates' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" /> Templates
          </button>
        </div>

        {activeTab === 'nodes' && (
          <div className="mt-2.5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search blocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Body: Draggable Nodes or Templates */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'nodes' ? (
          <div>
            {categories.map(cat => {
              const catNodes = filteredNodes.filter(n => n.category === cat);
              const isExpanded = expandedCategories[cat] !== false;

              return (
                <div key={cat} className="mb-3">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 py-0.5 hover:text-slate-600"
                  >
                    <span>{cat}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2">
                      {catNodes.map(nodeDef => {
                        const Icon = ICON_MAP[nodeDef.icon] || Cpu;

                        return (
                          <div
                            key={nodeDef.type}
                            onDragStart={(e) => onDragStart(e, nodeDef.type)}
                            draggable
                            className="group flex items-start gap-2.5 p-2.5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-soft transition-all duration-150"
                          >
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${nodeDef.color} text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                  {nodeDef.label}
                                </h4>
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                {nodeDef.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Load a pre-configured Machine Learning pipeline to experiment immediately:
            </p>
            {WORKFLOW_TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                onClick={() => onLoadTemplate(tmpl)}
                className="p-3 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer shadow-sm hover:shadow-soft transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-800 hover:text-purple-700">
                    {tmpl.name}
                  </h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    tmpl.problem_type === 'classification' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {tmpl.problem_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {tmpl.description}
                </p>
                <div className="mt-2 text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                  Click to load ({tmpl.nodes.length} nodes) →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag & Drop Hint */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-start gap-2 text-[11px] text-slate-500">
          <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong>Drag blocks</strong> onto the canvas, then <strong>connect handles</strong> to build your pipeline.
          </p>
        </div>
      </div>
    </aside>
  );
}
