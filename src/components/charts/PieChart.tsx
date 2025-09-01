import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Chart.module.css';

interface DonutChartProps<T> {
  data: T[];
  dataKey: string;
  nameKey: string;
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#fb923c', '#f87171'];

const DonutChart = <T extends object>({ 
  data, 
  dataKey, 
  nameKey 
}: DonutChartProps<T>): React.ReactElement => {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={60}
            innerRadius={40}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px'
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;