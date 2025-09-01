import React from 'react';
import styles from './PivotTableChart.module.css';

// ---▼ `any` 타입을 Record<string, string | number>로 수정 ▼---
// 피벗 테이블 데이터의 각 행이 문자열 키와 문자열 또는 숫자 값을 갖도록 명시합니다.
interface PivotData {
  [key: string]: string | number;
}
// ---▲ `any` 타입을 Record<string, string | number>로 수정 ▲---

interface PivotTableProps {
  data: PivotData[];
  // 어떤 키를 기준으로 행을 그룹화할지 지정합니다.
  rows: string[];
  // 어떤 키를 기준으로 열을 그룹화할지 지정합니다.
  cols: string[];
  // 집계할 값의 키를 지정합니다.
  value: string;
}

const PivotTable: React.FC<PivotTableProps> = ({ data, rows, cols, value }) => {
  // 피벗 테이블 데이터를 생성하는 로직
  const pivotData = new Map<string, Map<string, number>>();
  const rowHeaders = new Set<string>();
  const colHeaders = new Set<string>();

  data.forEach(item => {
    const rowKey = rows.map(key => item[key]).join(' / ');
    const colKey = cols.map(key => item[key]).join(' / ');

    rowHeaders.add(rowKey);
    colHeaders.add(colKey);

    if (!pivotData.has(rowKey)) {
      pivotData.set(rowKey, new Map<string, number>());
    }

    const currentCol = pivotData.get(rowKey)!;
    // item[value]가 문자열일 수 있으므로 Number()로 변환하여 안전하게 계산합니다.
    const currentValue = currentCol.get(colKey) || 0;
    currentCol.set(colKey, currentValue + (Number(item[value]) || 0));
  });

  const sortedRowHeaders = Array.from(rowHeaders).sort();
  const sortedColHeaders = Array.from(colHeaders).sort();

  return (
    <div className={styles.tableContainer}>
      <table className={styles.pivotTable}>
        <thead>
          <tr>
            {/* 행 헤더의 제목 (Rows/Cols) */}
            <th className={styles.headerCell}>{rows.join(' / ')} \ {cols.join(' / ')}</th>
            {/* 열 헤더 렌더링 */}
            {sortedColHeaders.map(colHeader => (
              <th key={colHeader} className={styles.headerCell}>{colHeader}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 행과 데이터 렌더링 */}
          {sortedRowHeaders.map(rowHeader => (
            <tr key={rowHeader}>
              <th className={styles.rowHeaderCell}>{rowHeader}</th>
              {sortedColHeaders.map(colHeader => {
                const value = pivotData.get(rowHeader)?.get(colHeader) || 0;
                return (
                  <td key={colHeader} className={styles.dataCell}>
                    {value.toLocaleString()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PivotTable;