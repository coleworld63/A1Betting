import React, { useEffect, useState } from 'react';
import { performanceService } from '../services/performanceService';

interface MetricDisplay {
  name: string;
  value: number;
  unit: string;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: MetricDisplay[] = [];

      // Long tasks
      const longTasks = performanceService.getMetrics('longTask');
      if (longTasks.length > 0) {
        const avgLongTask = longTasks.reduce((acc, m) => acc + m.value, 0) / longTasks.length;
        newMetrics.push({
          name: 'Average Long Task',
          value: avgLongTask,
          unit: 'ms',
        });
      }

      // Layout shifts
      const layoutShifts = performanceService.getMetrics('layoutShift');
      if (layoutShifts.length > 0) {
        const avgLayoutShift =
          layoutShifts.reduce((acc, m) => acc + m.value, 0) / layoutShifts.length;
        newMetrics.push({
          name: 'Average Layout Shift',
          value: avgLayoutShift,
          unit: '',
        });
      }

      // First input delay
      const firstInputs = performanceService.getMetrics('firstInput');
      if (firstInputs.length > 0) {
        const avgFirstInput = firstInputs.reduce((acc, m) => acc + m.value, 0) / firstInputs.length;
        newMetrics.push({
          name: 'Average First Input Delay',
          value: avgFirstInput,
          unit: 'ms',
        });
      }

      setMetrics(newMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-2">
        {metrics.map(metric => (
          <div key={metric.name} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">{metric.name}</span>
            <span className="text-sm font-mono">
              {metric.value.toFixed(2)}
              {metric.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PerformanceMonitor);
