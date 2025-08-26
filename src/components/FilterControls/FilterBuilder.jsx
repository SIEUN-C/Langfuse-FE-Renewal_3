// src/components/FilterControls/FilterBuilder.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, X, Plus } from 'lucide-react';
import FilterButton from '../FilterButton/FilterButton';
import styles from './FilterBuilder.module.css';

// --- 옵션 정의 (수정 없음) ---
// COLUMN_OPTIONS, OPERATORS, COLUMN_TYPE_MAP 등은 이전과 동일하게 둡니다.
export const COLUMN_OPTIONS = [
  "ID", "Name", "Timestamp", "User ID", "Session ID", "Metadata", "Version",
  "Release", "Level", "Tags", "Input Tokens", "Output Tokens", "Total Tokens",
  "Tokens", "Error Level Count", "Warning Level Count", "Default Level Count",
  "Debug Level Count", "Scores (numeric)", "Scores (categorical)", "Latency (s)",
  "Input Cost ($)", "Output Cost ($)", "Total Cost ($)",
];

const STRING_OPERATORS = ["=", "contains", "does not contain", "starts with", "ends with"];
const NUMERIC_OPERATORS = [">", "<", ">=", "<="];
const CATEGORICAL_OPERATORS = ["any of", "none of"];

const COLUMN_TYPE_MAP = {
  numeric: [
    "Timestamp", "Input Tokens", "Output Tokens", "Total Tokens", "Tokens",
    "Error Level Count", "Warning Level Count", "Default Level Count",
    "Debug Level Count", "Scores (numeric)", "Latency (s)", "Input Cost ($)",
    "Output Cost ($)", "Total Cost ($)"
  ],
  categorical: [
    "Tags", "Scores (categorical)", "ID", "Level"
  ],
  string: [
    "Name", "User ID", "Session ID", "Metadata", "Version", "Release"
  ],
};

// --- FilterBuilder 컴포넌트 ---
const FilterBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);

  // ❗️ 1. ref 이름 변경 및 메뉴 전용 ref 추가
  const containerRef = useRef(null); // 기존 dropdownRef -> containerRef로 이름 변경
  const menuRef = useRef(null);      // 메뉴(dropdownMenu)의 위치와 크기를 측정할 ref

  // ❗️ 2. 메뉴의 동적 스타일을 저장할 state 추가
  const [menuStyle, setMenuStyle] = useState({});

  // 이전과 동일한 필터 관련 로직들...
  const getOperatorsForColumn = (column) => {
    if (COLUMN_TYPE_MAP.numeric.includes(column)) {
      return NUMERIC_OPERATORS;
    }
    if (COLUMN_TYPE_MAP.categorical.includes(column)) {
      return CATEGORICAL_OPERATORS;
    }
    return STRING_OPERATORS;
  };

  // ❗️ 1. 초기 필터 상태에 metaKey 필드 추가
  const [filters, setFilters] = useState(() => {
    const initialColumn = COLUMN_OPTIONS[0];
    const initialOperators = getOperatorsForColumn(initialColumn);
    return [{
      id: 1,
      column: initialColumn,
      operator: initialOperators[0],
      value: '',
      metaKey: '', // Metadata key를 위한 상태
    }];
  });

  // ❗️ 2. 필터 추가 시 metaKey 필드 포함
  const addFilter = () => {
    const defaultColumn = COLUMN_OPTIONS[0];
    const initialOperators = getOperatorsForColumn(defaultColumn);
    const newFilter = {
      id: Date.now(),
      column: defaultColumn,
      operator: initialOperators[0],
      value: '',
      metaKey: '', // 새 필터에도 metaKey 추가
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const removeFilter = (id) => {
    if (filters.length === 1) {
      const initialColumn = COLUMN_OPTIONS[0];
      const initialOperators = getOperatorsForColumn(initialColumn);
      setFilters([{
        id: filters[0].id,
        column: initialColumn,
        operator: initialOperators[0],
        value: '',
        metaKey: '', // 초기화 시에도 metaKey 추가
      }]);
    } else {
      setFilters(prev => prev.filter(f => f.id !== id));
    }
  };

  const updateFilter = (id, field, value) => {
    setFilters(prev => prev.map(f => {
      if (f.id !== id) return f;
      if (field === 'column') {
        const newOperators = getOperatorsForColumn(value);
        return { ...f, column: value, operator: newOperators[0] };
      }
      // metaKey를 포함한 모든 필드를 동적으로 업데이트
      return { ...f, [field]: value };
    }));
  };
    
  // ❗️ 3. 메뉴가 열릴 때 위치를 계산하고 스타일을 적용하는 useEffect 추가
  useEffect(() => {
    if (isOpen && containerRef.current && menuRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth;
      const viewportWidth = window.innerWidth;
      const margin = 16; // 화면 가장자리로부터 최소한의 여백

      // 1. 기본 위치(left: 0)를 기준으로 메뉴의 절대 좌표를 계산합니다.
      let newLeft = 0; // 컨테이너 기준 상대 위치
      const absoluteMenuLeft = containerRect.left + newLeft;
      const absoluteMenuRight = absoluteMenuLeft + menuWidth;

      // 2. 오른쪽 화면 이탈 여부 확인
      if (absoluteMenuRight > viewportWidth - margin) {
        // 오른쪽으로 벗어났다면, 벗어난 만큼 왼쪽으로 이동시킵니다.
        const overflow = absoluteMenuRight - (viewportWidth - margin);
        newLeft -= overflow;
      }

      // 3. 왼쪽 화면 이탈 여부 확인
      if (absoluteMenuLeft + newLeft < margin) {
        // 왼쪽으로 벗어났다면, 벗어난 만큼 오른쪽으로 이동시킵니다.
        const overflow = margin - (absoluteMenuLeft + newLeft);
        newLeft += overflow;
      }
      
      // 4. 계산된 최종 위치를 스타일로 적용합니다.
      setMenuStyle({ left: `${newLeft}px` });
    }
  }, [isOpen]);

  // 외부 클릭 시 드롭다운 닫기 로직 (containerRef 사용하도록 수정)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const activeFilterCount = useMemo(() => filters.filter(f => f.value.trim() !== '').length, [filters]);

  return (
    // ❗️ 4. ref와 style 적용
    <div className={styles.container} ref={containerRef}>
      <FilterButton onClick={() => setIsOpen(!isOpen)}>
        <Filter size={14} /> Filters
        {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
      </FilterButton>

      {isOpen && (
        <div 
          className={styles.dropdownMenu} 
          ref={menuRef} 
          style={menuStyle}
        >
          {filters.map((filter, index) => (
            <div key={filter.id} className={styles.filterRow}>
              <span className={styles.conjunction}>{index === 0 ? 'Where' : 'And'}</span>
              <select 
                className={styles.select} 
                value={filter.column} 
                onChange={e => updateFilter(filter.id, 'column', e.target.value)}
              >
                {COLUMN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>

              {/* ❗️ 3. 'Metadata'가 선택됐을 때만 key 입력창을 조건부 렌더링 */}
              {filter.column === 'Metadata' && (
                <input
                  type="text"
                  className={styles.input}
                  placeholder="key"
                  value={filter.metaKey}
                  onChange={e => updateFilter(filter.id, 'metaKey', e.target.value)}
                />
              )}

              <select 
                className={styles.select} 
                value={filter.operator}
                onChange={e => updateFilter(filter.id, 'operator', e.target.value)}
              >
                {getOperatorsForColumn(filter.column).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <input
                type="text"
                className={styles.input}
                value={filter.value}
                placeholder="string"
                onChange={e => updateFilter(filter.id, 'value', e.target.value)}
              />
              <button className={styles.removeButton} onClick={() => removeFilter(filter.id)}>
                <X size={16} />
              </button>
            </div>
          ))}
          <button className={styles.addButton} onClick={addFilter}>
            <Plus size={14} /> Add filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBuilder;