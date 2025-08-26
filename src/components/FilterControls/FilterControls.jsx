// src/components/FilterControls/FilterControls.jsx
import React from 'react';
import styles from './FilterControls.module.css';
import TimeRangeFilter from './TimeRangeFilter';
import EnvironmentFilter from './EnvironmentFilter';
import FilterBuilder from './FilterBuilder';
import RefreshButton from './RefreshButton';

// envFilterProps와 timeRangeFilterProps를 props로 받도록 수정
const FilterControls = ({ onRefresh, envFilterProps, timeRangeFilterProps }) => {
  return (
    <div className={styles.filterControls}>
      <TimeRangeFilter {...timeRangeFilterProps} />
      <EnvironmentFilter {...envFilterProps} />
      <FilterBuilder />
      {onRefresh && <RefreshButton onClick={onRefresh} />}
    </div>
  );
};

export default FilterControls;