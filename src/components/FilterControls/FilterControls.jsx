// src/components/FilterControls/FilterControls.jsx
// 시간 범위, 환경, 속성 기반 필터 및 새로고침 버튼 등 다양한 필터 컴포넌트들을 하나로 묶어 사용자 인터페이스에 통합적으로 표시하는 역할
import React from 'react';
import styles from './FilterControls.module.css';
import TimeRangeFilter from './TimeRangeFilter';
import EnvironmentFilter from './EnvironmentFilter';
import FilterBuilder from './FilterBuilder';
import RefreshButton from './RefreshButton';

const FilterControls = ({ onRefresh, envFilterProps, timeRangeFilterProps, builderFilterProps }) => {
  return (
    <div className={styles.filterControls}>
      <TimeRangeFilter {...timeRangeFilterProps} />
      <EnvironmentFilter {...envFilterProps} />
      <FilterBuilder {...builderFilterProps} />
      {onRefresh && <RefreshButton onClick={onRefresh} />}
    </div>
  );
};

export default FilterControls;