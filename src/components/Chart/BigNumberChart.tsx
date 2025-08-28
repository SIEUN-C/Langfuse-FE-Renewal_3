import React from 'react';
import styles from './BigNumberChart.module.css';

interface BigNumberChartProps {
  // 표시할 값으로 숫자나 문자열을 받을 수 있습니다.
  value: number | string;
  // 값 뒤에 붙일 단위 (옵션)
  unit?: string;
}

const BigNumberChart: React.FC<BigNumberChartProps> = ({ value, unit }) => {
  return (
    <div className={styles.container}>
      <span className={styles.value}>
        {unit && <span className={styles.unit}>{unit}</span>}
        {value}
      </span>
    </div>
  );
};

export default BigNumberChart;