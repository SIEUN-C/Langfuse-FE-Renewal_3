import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './MultiSelectDropdown.module.css';

const MultiSelectDropdown = ({ options, value, onChange, placeholder = "Select" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e) => {
    onChange(e.target.checked ? options : []);
  };

  const handleOptionChange = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const isAllSelected = options.length > 0 && value.length === options.length;

  const displayLabel = () => {
    if (value.length === 0) return placeholder;
    if (isAllSelected) return 'All selected';
    if (value.length === 1) return value[0];
    return `${value.length} selected`;
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button type="button" className={styles.selectButton} onClick={() => setIsOpen(!isOpen)}>
        <span>{displayLabel()}</span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className={styles.optionsList}>
            <li className={styles.optionItem}>
              <label>
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                Select All
              </label>
            </li>
            {filteredOptions.map(option => (
              <li key={option} className={styles.optionItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => handleOptionChange(option)}
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;