// src/Pages/Prompts/ModelAdvancedSettingsPopover.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// --- ▼▼▼ [수정] CSS 파일 이름은 그대로지만, 내용은 Playground 팀의 것으로 교체됩니다 ▼▼▼ ---
import styles from "./ModelAdvancedSettingsPopover.module.css";
// --- ▲▲▲ [수정] 완료 ▲▲▲ ---
import { fetchProviderMaskedKey } from "../../lib/getMaskedKey";

// --- ▼▼▼ [수정] 컴포넌트 전체를 Playground 팀의 구조를 기반으로 다시 작성합니다 ▼▼▼ ---
export default function ModelAdvancedSettingsPopover({
  open,
  anchorRef,
  settings, // props 이름: values -> settings
  onSettingChange, // props 이름: onChange -> onSettingChange
  onClose,
  projectId,
  provider,
  onReset, // onReset prop 추가
  settingsPath = "/settings/llm-connections",
}) {
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();

  // 팝오버 열릴 때 프로젝트/프로바이더의 API Key 불러오기
  useEffect(() => {
    if (!open || !projectId || !provider) {
        setApiKey('');
        return;
    };
    (async () => {
      try {
        const masked = await fetchProviderMaskedKey({ projectId, provider });
        setApiKey(masked || "");
      } catch (e) {
        console.error("masked key fetch failed:", e);
        setApiKey("");
      }
    })();
  }, [open, projectId, provider]);

  // 위치 계산
  useEffect(() => {
    if (open && anchorRef?.current && popoverRef.current) {
      const buttonRect = anchorRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = buttonRect.right + 8;
      let top = buttonRect.top;

      if (left + popoverRect.width > viewportWidth) {
        left = buttonRect.left - popoverRect.width - 8;
      }
      if (top + popoverRect.height > viewportHeight) {
        top = viewportHeight - popoverRect.height - 8;
      }

      setPosition({
        top: Math.max(8, top),
        left: Math.max(8, left),
      });
    }
  }, [open, anchorRef]);

  // 외부 클릭/ESC 닫기
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open, onClose, anchorRef]);

  // 숫자 입력 안전 파서 & 유틸
  const toFloat = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const toInt = (v, fallback) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };
  
  // onSettingChange를 여러 번 호출하는 대신, 한 번에 객체로 업데이트
  const update = (newParams) => onSettingChange({ ...settings, ...newParams });

  const handleManageKeys = () => navigate(settingsPath);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className={styles.advWrap}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Model Advanced Settings"
    >
      <div className={styles.advHeader}>
        <h3 className={styles.advTitle}>Model Advanced Settings</h3>
        <button onClick={onClose} className={styles.advCloseBtn} aria-label="close">
          ×
        </button>
      </div>

      <div className={styles.advBody}>
        <p className={styles.advDescription}>Configure advanced parameters for your model.</p>

        {/* Temperature */}
        <div className={styles.advParameterRow}>
          <div className={styles.advParameterInfo}>
            <label className={styles.advLabel}>Temperature</label>
          </div>
          <div className={styles.advParameterControls}>
            <input
              type="number"
              value={settings.temperature ?? 0}
              onChange={(e) => update({ temperature: toFloat(e.target.value, 0) })}
              className={styles.advValueInput}
              step="0.1"
              min="0"
              max="2"
            />
            <div
              className={`${styles.advToggleSwitch} ${
                settings.useTemperature ? styles.advToggleOn : ""
              }`}
              onClick={() => update({ useTemperature: !settings.useTemperature })}
              role="switch"
              aria-checked={!!settings.useTemperature}
            >
              <span className={styles.advToggleThumb} />
            </div>
          </div>
        </div>
        {settings.useTemperature && (
          <div className={styles.advSliderRow}>
            <input
              type="range"
              value={settings.temperature ?? 0}
              onChange={(e) => update({ temperature: toFloat(e.target.value, 0) })}
              className={styles.advSlider}
              min="0"
              max="2"
              step="0.1"
            />
          </div>
        )}

        {/* Output token limit */}
        <div className={styles.advParameterRow}>
          <div className={styles.advParameterInfo}>
            <label className={styles.advLabel}>Output token limit</label>
          </div>
          <div className={styles.advParameterControls}>
            <input
              type="number"
              value={settings.maxTokens ?? 4096}
              onChange={(e) => update({ maxTokens: toInt(e.target.value, 4096) })}
              className={styles.advValueInput}
              min="1"
            />
            <div
              className={`${styles.advToggleSwitch} ${
                settings.useMaxTokens ? styles.advToggleOn : ""
              }`}
              onClick={() => update({ useMaxTokens: !settings.useMaxTokens })}
              role="switch"
              aria-checked={!!settings.useMaxTokens}
            >
              <span className={styles.advToggleThumb} />
            </div>
          </div>
        </div>
        {settings.useMaxTokens && (
          <div className={styles.advSliderRow}>
            <input
              type="range"
              value={settings.maxTokens ?? 4096}
              onChange={(e) => update({ maxTokens: toInt(e.target.value, 4096) })}
              className={styles.advSlider}
              min="100"
              max="8192"
              step="100"
            />
          </div>
        )}

        {/* Top P */}
        <div className={styles.advParameterRow}>
          <div className={styles.advParameterInfo}>
            <label className={styles.advLabel}>Top P</label>
          </div>
          <div className={styles.advParameterControls}>
            <input
              type="number"
              value={settings.topP ?? 1}
              onChange={(e) => update({ topP: toFloat(e.target.value, 1) })}
              className={styles.advValueInput}
              step="0.05"
              min="0"
              max="1"
            />
            <div
              className={`${styles.advToggleSwitch} ${settings.useTopP ? styles.advToggleOn : ""}`}
              onClick={() => update({ useTopP: !settings.useTopP })}
              role="switch"
              aria-checked={!!settings.useTopP}
            >
              <span className={styles.advToggleThumb} />
            </div>
          </div>
        </div>
        {settings.useTopP && (
          <div className={styles.advSliderRow}>
            <input
              type="range"
              value={settings.topP ?? 1}
              onChange={(e) => update({ topP: toFloat(e.target.value, 1) })}
              className={styles.advSlider}
              min="0"
              max="1"
              step="0.05"
            />
          </div>
        )}

        {/* Additional options */}
        <div className={styles.advParameterRow}>
          <div className={styles.advParameterInfo}>
            <label className={styles.advLabel}>Additional options</label>
            <div className={styles.advHelpIcon} title="Additional configuration options">
              ?
            </div>
          </div>
          <div className={styles.advParameterControls}>
            <div
              className={`${styles.advToggleSwitch} ${
                settings.additionalOptions ? styles.advToggleOn : ""
              }`}
              onClick={() => update({ additionalOptions: !settings.additionalOptions })}
              role="switch"
              aria-checked={!!settings.additionalOptions}
            >
              <span className={styles.advToggleThumb} />
            </div>
          </div>
        </div>

        {/* API key */}
        <div className={styles.advParameterRow}>
          <div className={styles.advParameterInfo}>
            <label className={styles.advLabel}>API key</label>
          </div>
          <div className={styles.advParameterControls}>
            <button
              type="button"
              onClick={handleManageKeys}
              className={styles.advApiKeyBtn}
              title="LLM 키 관리 페이지로 이동"
            >
              {apiKey || "API Key 없음"}
            </button>
          </div>
        </div>
      </div>
      
       <div className={styles.advFooter}>
        <button onClick={onReset} className={styles.advResetButton}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
// --- ▲▲▲ [수정] 완료 ▲▲▲ ---





//기존 코드(UI+apikey만 가져옴/playground 팀꺼 가져오기 전)
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
//   // 1. Provider 이름 대신, 마스킹된 API Key 값을 직접 받도록 props를 변경합니다.
//   apiKeyDisplayValue,
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
//         {/* 2. 기존 select를 읽기 전용 input으로 변경하고, props로 받은 API Key 값을 표시합니다. */}
//         <div className={styles.formGroup}>
//             <div className={styles.labelWrapper}>
//                 <label htmlFor="api-key-display">API key</label>
//             </div>
//             <input
//                 id="api-key-display"
//                 type="text"
//                 className={styles.readOnlyInput}
//                 value={apiKeyDisplayValue || '...'}
//                 readOnly
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




