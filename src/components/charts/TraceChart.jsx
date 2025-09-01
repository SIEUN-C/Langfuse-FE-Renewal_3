import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import styles from './TraceChart.module.css';

const data = [
  { date: '2025-08-01', traces: 12 },
  { date: '2025-08-02', traces: 18 },
  { date: '2025-08-03', traces: 8 },
  { date: '2025-08-04', traces: 20 },
  { date: '2025-08-05', traces: 10 },
];

export default function TraceChart() {
  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>📈 Traces Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#e2e8f0',
            }}
          />
          <Line
            type="monotone"
            dataKey="traces"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3, stroke: '#e0e7ff', strokeWidth: 1.5, fill: '#4f46e5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}