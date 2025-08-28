import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import styles from './Chart.module.css';

// T는 어떤 객체 타입이든 받을 수 있도록 제네릭으로 선언합니다.
interface BarChartProps<T> {
  data: T[];
  dataKey: string;
  nameKey: string;
  layout?: 'horizontal' | 'vertical';
}

const BarChart = <T extends object>({
  data,
  dataKey,
  nameKey,
  layout = 'horizontal',
}: BarChartProps<T>): React.ReactElement => {
  const isVerticalLayout = layout === 'vertical';

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          
          <XAxis
            type={isVerticalLayout ? 'number' : 'category'}
            dataKey={isVerticalLayout ? dataKey : nameKey}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type={isVerticalLayout ? 'category' : 'number'}
            dataKey={isVerticalLayout ? nameKey : dataKey}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={isVerticalLayout ? 100 : 30}
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

          <Bar dataKey={dataKey} fill="#64748b" barSize={20}>
            {isVerticalLayout && <LabelList dataKey={dataKey} position="right" fill="#94a3b8" fontSize={12} />}
          </Bar>

        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;