import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DatasetAnalysis, ModelMetrics } from '../../types';
import {
  Cpu,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  Database,
  BarChart2,
  FileSpreadsheet,
  Award,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const AdminTrainingPage: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Career');
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [analysisData, metricsData] = await Promise.allSettled([
        api.getDatasetAnalysis(),
        api.getModelMetrics()
      ]);

      if (analysisData.status === 'fulfilled') {
        setAnalysis(analysisData.value);
        if (analysisData.value.potential_targets?.length > 0) {
          setSelectedTarget(analysisData.value.potential_targets[0].column);
        }
      }

      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      const data = await api.uploadDataset(file);
      setAnalysis(data);
      if (data.potential_targets?.length > 0) {
        setSelectedTarget(data.potential_targets[0].column);
      }
      showToast(`Dataset "${file.name}" uploaded and inspected (${data.num_rows} rows)!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload dataset', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTrainModels = async () => {
    try {
      setTraining(true);
      const res = await api.trainModel(selectedTarget, analysis?.file_path);
      setMetrics(res.metadata);
      await refreshData();
      showToast(`Models evaluated! Activated best model: ${res.metadata.model_name} (${res.metadata.accuracy}% acc)!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to train ML model', 'error');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AI / Machine Learning Training Studio (Admin)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload custom tabular datasets (CSV / XLSX), inspect features, select target labels, and train multi-model classifiers with real cross-validation.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto"
          title="Refresh ML Engine Status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Dataset Upload & Inspection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Upload Custom Dataset
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Upload a student or employee performance dataset in CSV or Excel format. The system will adaptively detect feature types and suggest label targets.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <label className="cursor-pointer font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:underline block">
              <span>{uploading ? 'Analyzing Structure...' : 'Select CSV or Excel (.xlsx)'}</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-400 block font-mono">
              Max size: 25MB
            </span>
          </div>

          {analysis && (
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              Active File: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{analysis.file_name}</span>
            </div>
          )}
        </div>

        {/* Dataset Stats Summary */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dataset Statistical Inspection
              </h3>
            </div>
            {analysis && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {analysis.is_supervised_ready ? 'Supervised Classification Ready' : 'Unsupervised Clustering Mode'}
              </span>
            )}
          </div>

          {analysis ? (
            <div className="space-y-4">
              {/* Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Total Rows</div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {analysis.num_rows}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Columns</div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {analysis.num_columns}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Numerical</div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {analysis.numerical_columns.length}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-[11px] text-slate-400">Missing Cells</div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {analysis.total_missing}
                  </div>
                </div>
              </div>

              {/* Training Config & Target Selection */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Target Label Column (Supervised Prediction Output)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Select the column representing career outcome or job role.
                    </span>
                  </div>

                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    {analysis.potential_targets.map((pt) => (
                      <option key={pt.column} value={pt.column}>
                        {pt.column} ({pt.unique_classes} classes · {pt.confidence} match)
                      </option>
                    ))}
                    {analysis.columns.filter(c => !analysis.potential_targets.some(pt => pt.column === c)).map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleTrainModels}
                    disabled={training}
                    className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {training ? 'Training & Evaluating Models...' : 'Train & Compare ML Models'}
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              No dataset loaded. Upload a dataset or wait for initial benchmark dataset.
            </div>
          )}
        </div>
      </div>

      {/* Trained ML Model Performance Report */}
      {metrics && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Active Production Model: {metrics.model_name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Version: {metrics.model_version} · Trained: {metrics.training_date.slice(0, 10)} · Target: {metrics.target_column}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                Accuracy: {metrics.accuracy}%
              </span>
              <span className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                F1-Score: {metrics.f1_score}%
              </span>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Classifier Evaluation Benchmark (Real Test Set Performance)
            </h4>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Model Architecture</th>
                    <th className="py-2.5 px-4 font-mono">Accuracy</th>
                    <th className="py-2.5 px-4 font-mono">Precision</th>
                    <th className="py-2.5 px-4 font-mono">Recall</th>
                    <th className="py-2.5 px-4 font-mono">F1-Score</th>
                    <th className="py-2.5 px-4">Selection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(metrics.all_model_evaluations).map(([name, ev]) => {
                    const isBest = name === metrics.model_name;
                    return (
                      <tr
                        key={name}
                        className={isBest ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold' : ''}
                      >
                        <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100">{name}</td>
                        <td className="py-2.5 px-4 font-mono">{ev.accuracy}%</td>
                        <td className="py-2.5 px-4 font-mono">{ev.precision}%</td>
                        <td className="py-2.5 px-4 font-mono">{ev.recall}%</td>
                        <td className="py-2.5 px-4 font-mono">{ev.f1_score}%</td>
                        <td className="py-2.5 px-4">
                          {isBest ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Active (Selected)
                            </span>
                          ) : (
                            <span className="text-slate-400">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Feature Importances */}
          {metrics.feature_importances && Object.keys(metrics.feature_importances).length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Top Influential Decision Features (Feature Importance)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(metrics.feature_importances).slice(0, 8).map(([feat, imp]) => (
                  <div
                    key={feat}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {feat.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                      {imp}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career Classes Supported */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
              Career Class Targets ({metrics.career_classes.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {metrics.career_classes.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
