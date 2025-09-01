import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './Chart.module.css';

// 차트 데이터 포인트의 타입을 정의합니다.
// T는 어떤 객체 타입이든 받을 수 있도록 제네릭으로 선언합니다.
interface HistogramChartProps<T> {
  data: T[];
  dataKey: string;
  nameKey: string;
}

const HistogramChart = <T extends object>({
  data,
  dataKey,
  nameKey,
}: HistogramChartProps<T>): React.ReactElement => {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          // barCategoryGap을 0으로 설정하여 막대 사이의 간격을 없앱니다.
          barCategoryGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          
          <XAxis
            dataKey={nameKey}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={30}
          />

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

          <Bar dataKey={dataKey} fill="#8884d8" />

        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;