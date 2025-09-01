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