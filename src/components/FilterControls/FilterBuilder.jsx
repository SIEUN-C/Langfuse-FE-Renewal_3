import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, X, Plus, Calendar } from 'lucide-react';
import FilterButton from '../FilterButton/FilterButton';
import styles from './FilterBuilder.module.css';
import DateRangePopup from '../DateRange/DateRangePopup';
import dayjs from 'dayjs';
import MultiSelectDropdown from './MultiSelectDropdown';

const FilterBuilder = ({ filters, onFilterChange, filterConfig }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const menuRef = useRef(null);
    const [datePickerState, setDatePickerState] = useState({ isOpen: false, filterId: null, triggerRef: null });

    const getColumnConfig = (columnKey) => filterConfig.find(c => c.key === columnKey);

    const addFilter = () => {
        const defaultColumn = filterConfig[0];
        const newFilter = { id: Date.now(), column: defaultColumn.key, operator: defaultColumn.operators[0], value: '', metaKey: '' };
        onFilterChange([...filters, newFilter]);
    };

    const removeFilter = (id) => {
        const newFilters = filters.filter(f => f.id !== id);
        if (newFilters.length === 0) {
            addFilter();
        } else {
            onFilterChange(newFilters);
        }
    };

    const updateFilter = (id, field, value) => {
        onFilterChange(prev => prev.map(f => {
            if (f.id !== id) return f;
            if (field === 'column') {
                const newColumnConfig = getColumnConfig(value);
                return { ...f, column: value, operator: newColumnConfig.operators[0], value: '', metaKey: '' };
            }
            return { ...f, [field]: value };
        }));
    };

    const renderValueInput = (filter) => {
        const config = getColumnConfig(filter.column);
        if (!config) return null;

        switch (config.type) {
            case 'date':
                return (
                    <button className={styles.dateButton} onClick={(e) => handleOpenDatePicker(e, filter.id)}>
                        <Calendar size={14} />
                        <span>{filter.value ? dayjs(filter.value).format('YYYY-MM-DD') : 'Pick a date'}</span>
                    </button>
                );
            case 'number':
                return (
                    <input type="number" className={`${styles.input} ${styles.valueInput}`} value={filter.value} placeholder="0" onChange={e => updateFilter(filter.id, 'value', e.target.value)} />
                );
            case 'categorical':
                 return (
                    <div className={styles.valueInput}>
                        <MultiSelectDropdown
                            options={config.options || []}
                            value={Array.isArray(filter.value) ? filter.value : (filter.value ? filter.value.split(',') : [])}
                            onChange={value => updateFilter(filter.id, 'value', value.join(','))}
                            placeholder="Select options..."
                        />
                    </div>
                );
            case 'string':
            default:
                return (
                    <input type="text" className={`${styles.input} ${styles.valueInput}`} value={filter.value} placeholder="value" onChange={e => updateFilter(filter.id, 'value', e.target.value)} />
                );
        }
    };

    const handleOpenDatePicker = (event, filterId) => {
        setDatePickerState({ isOpen: true, filterId, triggerRef: { current: event.currentTarget } });
    };

    const handleDateSelect = (date) => {
        if (datePickerState.filterId) {
            updateFilter(datePickerState.filterId, 'value', dayjs(date).format('YYYY-MM-DD HH:mm:ss'));
            closeDatePicker();
        }
    };

    const closeDatePicker = () => {
        setDatePickerState({ isOpen: false, filterId: null, triggerRef: null });
    };

    const currentFilterDate = useMemo(() => {
        const filter = filters.find(f => f.id === datePickerState.filterId);
        return filter?.value ? new Date(filter.value) : new Date();
    }, [filters, datePickerState.filterId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeFilterCount = useMemo(() => filters.filter(f => String(f.value || '').trim() !== '').length, [filters]);

    return (
        <div className={styles.container} ref={containerRef}>
            <FilterButton onClick={() => setIsOpen(!isOpen)}>
                <Filter size={14} /> Filters
                {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
            </FilterButton>

            {isOpen && (
                <div className={styles.dropdownMenu} ref={menuRef}>
                    {filters.map((filter, index) => {
                        const columnConfig = getColumnConfig(filter.column);
                        return (
                            <div key={filter.id} className={styles.filterRow}>
                                <span className={styles.conjunction}>{index === 0 ? 'Where' : 'And'}</span>
                                <select className={styles.select} value={filter.column} onChange={e => updateFilter(filter.id, 'column', e.target.value)}>
                                    {filterConfig.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                                </select>
                                
                                {/* [추가] hasMetaKey가 true일 때만 key 입력창을 렌더링합니다. */}
                                {columnConfig?.hasMetaKey && (
                                    <input
                                        type="text"
                                        className={`${styles.input} ${styles.metaKeyInput}`}
                                        placeholder="key"
                                        value={filter.metaKey}
                                        onChange={e => updateFilter(filter.id, 'metaKey', e.target.value)}
                                    />
                                )}

                                <select className={styles.select} value={filter.operator} onChange={e => updateFilter(filter.id, 'operator', e.target.value)}>
                                    {(columnConfig?.operators || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                {renderValueInput(filter)}
                                <button className={styles.removeButton} onClick={() => removeFilter(filter.id)}><X size={16} /></button>
                            </div>
                        )
                    })}
                    <button className={styles.addButton} onClick={addFilter}><Plus size={14} /> Add filter</button>
                </div>
            )}

            {datePickerState.isOpen && (
                <DateRangePopup
                    startDate={currentFilterDate}
                    endDate={currentFilterDate}
                    setStartDate={handleDateSelect}
                    setEndDate={handleDateSelect}
                    onClose={closeDatePicker}
                    triggerRef={datePickerState.triggerRef}
                />
            )}
        </div>
    );
};

export default FilterBuilder;