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
    // 메뉴가 닫혀있거나, ref가 준비되지 않았으면 아무것도 하지 않음
    if (!isOpen || !containerRef.current || !menuRef.current) {
      return;
    }

    const containerElement = containerRef.current;
    const menuElement = menuRef.current;

    // 위치를 다시 계산하고 적용하는 함수
    const recalculatePosition = () => {
    const containerRect = containerElement.getBoundingClientRect();
    const menuWidth = menuElement.offsetWidth; // getBoundingClientRect().width 대신 사용
    const viewportWidth = window.innerWidth;
    const margin = 16;

    let newLeft = 0;
    const absoluteMenuLeft = containerRect.left + newLeft;
    const absoluteMenuRight = absoluteMenuLeft + menuWidth;

    if (absoluteMenuRight > viewportWidth - margin) {
      const overflow = absoluteMenuRight - (viewportWidth - margin);
      newLeft -= overflow;
    }

    if (absoluteMenuLeft + newLeft < margin) {
      const overflow = margin - (absoluteMenuLeft + newLeft);
      newLeft += overflow;
    }
    
    // 불필요한 리렌더링을 방지하기 위해 직접 스타일을 적용
    menuElement.style.left = `${newLeft}px`;
  };

    // ResizeObserver 인스턴스 생성. 메뉴 크기가 바뀔 때마다 recalculatePosition 호출
    const resizeObserver = new ResizeObserver(recalculatePosition);
    
    // 메뉴 요소의 크기 변경 감시 시작
    resizeObserver.observe(menuElement);
    
    // 초기 위치 계산을 위해 한 번 호출
    recalculatePosition();

    // cleanup 함수: 컴포넌트가 unmount되거나, 메뉴가 닫힐 때 observer 연결 해제
    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen]); // 이제 이 useEffect는 메뉴가 열리고 닫힐 때만 실행됨


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