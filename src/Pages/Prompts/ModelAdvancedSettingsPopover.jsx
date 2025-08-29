// src/Pages/Prompts/ModelAdvancedSettingsPopover.jsx

import React, { useEffect, useRef, useState } from 'react';
import styles from './ModelAdvancedSettingsPopover.module.css';
import { X } from 'lucide-react';

const ModelAdvancedSettingsPopover = ({
  open,
  onClose,
  settings,
  onSettingChange,
  onReset,
  anchorRef,
  // --- ▼▼▼ 수정된 부분 시작 ▼▼▼ ---
  // 1. Provider 이름 대신, 마스킹된 API Key 값을 직접 받도록 props를 변경합니다.
  apiKeyDisplayValue,
  // --- ▲▲▲ 수정된 부분 끝 ▲▲▲ ---
}) => {
  const popoverRef = useRef(null);

  const [isTemperatureEnabled, setIsTemperatureEnabled] = useState(true);
  const [isMaxTokensEnabled, setIsMaxTokensEnabled] = useState(true);
  const [isTopPEnabled, setIsTopPEnabled] = useState(true);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && anchorRef.current && !anchorRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const handleChange = (key, value, isNumber = false) => {
    const processedValue = isNumber ? parseFloat(value) : value;
    onSettingChange(key, processedValue);
  };

  return (
    <div ref={popoverRef} className={styles.popover}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Model Advanced Settings</h3>
          <p className={styles.subtitle}>Configure advanced parameters for your model.</p>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.body}>
        {/* Temperature */}
        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <label htmlFor="temperature">Temperature</label>
            <div className={styles.controlGroup}>
              <span>{settings.temperature.toFixed(2)}</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isTemperatureEnabled}
                  onChange={() => setIsTemperatureEnabled(!isTemperatureEnabled)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
          <input
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={settings.temperature}
            onChange={(e) => handleChange('temperature', e.target.value, true)}
            disabled={!isTemperatureEnabled}
          />
        </div>

        {/* Output token limit */}
        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <label htmlFor="max-tokens">Output token limit</label>
            <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isMaxTokensEnabled}
                  onChange={() => setIsMaxTokensEnabled(!isMaxTokensEnabled)}
                />
                <span className={styles.slider}></span>
              </label>
          </div>
          <input
            id="max-tokens"
            type="number"
            className={styles.numberInput}
            value={settings.maxTokens}
            onChange={(e) => handleChange('maxTokens', e.target.value, true)}
            disabled={!isMaxTokensEnabled}
          />
        </div>

        {/* Top P */}
        <div className={styles.formGroup}>
          <div className={styles.labelWrapper}>
            <label htmlFor="top-p">Top P</label>
            <div className={styles.controlGroup}>
              <span>{settings.topP.toFixed(2)}</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isTopPEnabled}
                  onChange={() => setIsTopPEnabled(!isTopPEnabled)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
          <input
            id="top-p"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.topP}
            onChange={(e) => handleChange('topP', e.target.value, true)}
            disabled={!isTopPEnabled}
          />
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Additional options</span>
        </div>

        {/* --- ▼▼▼ 수정된 부분 시작 ▼▼▼ --- */}
        {/* 2. 기존 select를 읽기 전용 input으로 변경하고, props로 받은 API Key 값을 표시합니다. */}
        <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
                <label htmlFor="api-key-display">API key</label>
            </div>
            <input
                id="api-key-display"
                type="text"
                className={styles.readOnlyInput}
                value={apiKeyDisplayValue || '...'}
                readOnly
            />
        </div>
        {/* --- ▲▲▲ 수정된 부분 끝 ▲▲▲ --- */}

      </div>
      
      <div className={styles.footer}>
        <button onClick={onReset} className={styles.resetButton}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
};

export default ModelAdvancedSettingsPopover;






// // src/Pages/Prompts/ModelAdvancedSettingsPopover.jsx

// import React, { useEffect, useRef, useState } from 'react';
// import styles from './ModelAdvancedSettingsPopover.module.css';
// import { X } from 'lucide-react';

// const ModelAdvancedSettingsPopover = ({
//   open,
//   onClose,
//   settings,
//   onSettingChange,
//   onReset,
//   anchorRef,
//   // --- ▼▼▼ 수정된 부분 시작 ▼▼▼ ---
//   // 1. providers 목록 대신, 선택된 provider의 '이름'만 받도록 props를 변경합니다.
//   selectedProviderName,
//   // --- ▲▲▲ 수정된 부분 끝 ▲▲▲ ---
// }) => {
//   const popoverRef = useRef(null);

//   const [isTemperatureEnabled, setIsTemperatureEnabled] = useState(true);
//   const [isMaxTokensEnabled, setIsMaxTokensEnabled] = useState(true);
//   const [isTopPEnabled, setIsTopPEnabled] = useState(true);

//   useEffect(() => {
//     if (!open) return;
//     const handleClickOutside = (event) => {
//       if (popoverRef.current && !popoverRef.current.contains(event.target) && anchorRef.current && !anchorRef.current.contains(event.target)) {
//         onClose();
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [open, onClose, anchorRef]);

//   if (!open) return null;

//   const handleChange = (key, value, isNumber = false) => {
//     const processedValue = isNumber ? parseFloat(value) : value;
//     onSettingChange(key, processedValue);
//   };

//   return (
//     <div ref={popoverRef} className={styles.popover}>
//       <div className={styles.header}>
//         <div>
//           <h3 className={styles.title}>Model Advanced Settings</h3>
//           <p className={styles.subtitle}>Configure advanced parameters for your model.</p>
//         </div>
//         <button onClick={onClose} className={styles.closeButton}>
//           <X size={18} />
//         </button>
//       </div>

//       <div className={styles.body}>
//         {/* Temperature */}
//         <div className={styles.formGroup}>
//           <div className={styles.labelWrapper}>
//             <label htmlFor="temperature">Temperature</label>
//             <div className={styles.controlGroup}>
//               <span>{settings.temperature.toFixed(2)}</span>
//               <label className={styles.switch}>
//                 <input
//                   type="checkbox"
//                   checked={isTemperatureEnabled}
//                   onChange={() => setIsTemperatureEnabled(!isTemperatureEnabled)}
//                 />
//                 <span className={styles.slider}></span>
//               </label>
//             </div>
//           </div>
//           <input
//             id="temperature"
//             type="range"
//             min="0"
//             max="2"
//             step="0.01"
//             value={settings.temperature}
//             onChange={(e) => handleChange('temperature', e.target.value, true)}
//             disabled={!isTemperatureEnabled}
//           />
//         </div>

//         {/* Output token limit */}
//         <div className={styles.formGroup}>
//           <div className={styles.labelWrapper}>
//             <label htmlFor="max-tokens">Output token limit</label>
//             <label className={styles.switch}>
//                 <input
//                   type="checkbox"
//                   checked={isMaxTokensEnabled}
//                   onChange={() => setIsMaxTokensEnabled(!isMaxTokensEnabled)}
//                 />
//                 <span className={styles.slider}></span>
//               </label>
//           </div>
//           <input
//             id="max-tokens"
//             type="number"
//             className={styles.numberInput}
//             value={settings.maxTokens}
//             onChange={(e) => handleChange('maxTokens', e.target.value, true)}
//             disabled={!isMaxTokensEnabled}
//           />
//         </div>

//         {/* Top P */}
//         <div className={styles.formGroup}>
//           <div className={styles.labelWrapper}>
//             <label htmlFor="top-p">Top P</label>
//             <div className={styles.controlGroup}>
//               <span>{settings.topP.toFixed(2)}</span>
//               <label className={styles.switch}>
//                 <input
//                   type="checkbox"
//                   checked={isTopPEnabled}
//                   onChange={() => setIsTopPEnabled(!isTopPEnabled)}
//                 />
//                 <span className={styles.slider}></span>
//               </label>
//             </div>
//           </div>
//           <input
//             id="top-p"
//             type="range"
//             min="0"
//             max="1"
//             step="0.01"
//             value={settings.topP}
//             onChange={(e) => handleChange('topP', e.target.value, true)}
//             disabled={!isTopPEnabled}
//           />
//         </div>

//         <div className={styles.divider}>
//           <span className={styles.dividerText}>Additional options</span>
//         </div>

//         {/* --- ▼▼▼ 수정된 부분 시작 ▼▼▼ --- */}
//         {/* 2. 기존 select를 읽기 전용 input으로 변경합니다. */}
//         <div className={styles.formGroup}>
//             <div className={styles.labelWrapper}>
//                 <label htmlFor="api-key-display">API key</label>
//             </div>
//             <input
//                 id="api-key-display"
//                 type="text"
//                 className={styles.readOnlyInput} // 읽기 전용 스타일 적용
//                 value={selectedProviderName || '...'} // props로 받은 이름을 표시
//                 readOnly // 수정 불가능하도록 설정
//             />
//         </div>
//         {/* --- ▲▲▲ 수정된 부분 끝 ▲▲▲ --- */}

//       </div>
      
//       <div className={styles.footer}>
//         <button onClick={onReset} className={styles.resetButton}>
//           Reset to defaults
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ModelAdvancedSettingsPopover;