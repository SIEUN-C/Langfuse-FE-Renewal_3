// src/components/FilterControls/TimeRangeFilter.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import FilterButton from '../FilterButton/FilterButton';
import styles from './TimeRangeFilter.module.css';

const TimeRangeFilter = ({
  buttonLabel,
  selectedOption,
  timeOptions,
  handleTimeSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * 컴포넌트 외부를 클릭했을 때 드롭다운 메뉴를 닫는 효과를 처리합니다.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  /**
   * 시간 범위 옵션을 선택했을 때, 상태를 업데이트하고 드롭다운을 닫습니다.
   * @param {object} option - 선택된 시간 범위 옵션 객체
   */
  const onSelect = (option) => {
    handleTimeSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <FilterButton onClick={() => setIsOpen(!isOpen)}>
        {buttonLabel} <ChevronDown size={16} />
      </FilterButton>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {timeOptions.map((option) => (
            <div
              key={option.label}
              className={`${styles.dropdownItem} ${selectedOption.label === option.label ? styles.selected : ''}`}
              onClick={() => onSelect(option)}
            >
              {selectedOption.label === option.label && <span className={styles.checkmark}>✓</span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeRangeFilter;