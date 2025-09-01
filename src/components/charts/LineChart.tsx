import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './Chart.module.css';

interface LineChartProps<T> {
  data: T[];
  dataKey: string;
  nameKey: string;
}

const LineChart = <T extends object>({ data, dataKey, nameKey }: LineChartProps<T>): React.ReactElement => {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={nameKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px'
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke="#60a5fa" strokeWidth={2} dot={false} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;