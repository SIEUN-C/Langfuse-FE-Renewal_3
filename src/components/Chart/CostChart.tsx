import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import styles from './Chart.module.css';

// 이미지의 차트와 유사한 더미 데이터
const data = [
  { date: '8/7/25', cost: 1 },
  { date: '8/8/25', cost: 2 },
  { date: '8/9/25', cost: 1.5 },
  { date: '8/10/25', cost: 3 },
  { date: '8/11/25', cost: 2.5 },
  { date: '8/12/25', cost: 4 },
];

export default function CostChart() {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px'
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#4ade80" /* 초록색 라인 */
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}