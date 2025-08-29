import React, { useState, useEffect, useMemo } from 'react';
import styles from './PromptsReference.module.css';
import { fetchPromptLinkOptions } from './promptsApi'; // 이 API는 promptsApi.js에 있어야 합니다.
import { X, Clipboard, ExternalLink } from 'lucide-react';
import useProjectId from '../../hooks/useProjectId'; // [추가] useProjectId 훅을 import 합니다.

const PromptsReference = ({ onClose, onInsert }) => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromptName, setSelectedPromptName] = useState('');
  const [referenceBy, setReferenceBy] = useState('Version');
  const [selectedValue, setSelectedValue] = useState('');

  const { projectId } = useProjectId(); // [추가] useProjectId 훅을 호출하여 projectId를 가져옵니다.

  useEffect(() => {
    // [추가] projectId가 없으면 API를 호출하지 않도록 방어 코드를 추가합니다.
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    const loadPrompts = async () => {
      setIsLoading(true);
      // [수정] fetchPromptLinkOptions 호출 시 projectId를 인자로 전달합니다.
      const availablePrompts = await fetchPromptLinkOptions(projectId);
      setPrompts(availablePrompts);
      if (availablePrompts.length > 0) {
        setSelectedPromptName(availablePrompts[0].name);
        setReferenceBy('Version');
        if (availablePrompts[0].versions?.length > 0) {
          setSelectedValue(availablePrompts[0].versions[0]);
        }
      }
      setIsLoading(false);
    };
    loadPrompts();
  }, [projectId]); //

  const selectedPromptObject = useMemo(() => {
    return prompts.find(p => p.name === selectedPromptName);
  }, [selectedPromptName, prompts]);

  const referenceTag = useMemo(() => {
    if (!selectedPromptName || !selectedValue) return '';
    const type = referenceBy.toLowerCase();
    return `@@@langfusePrompt:name=${selectedPromptName}|${type}=${selectedValue}@@@`;
  }, [selectedPromptName, referenceBy, selectedValue]);

  const handlePromptNameChange = (e) => {
    const newPromptName = e.target.value;
    setSelectedPromptName(newPromptName);

    const newPrompt = prompts.find(p => p.name === newPromptName);
    if (newPrompt) {
      if (referenceBy === 'Version' && newPrompt.versions?.length > 0) {
        setSelectedValue(newPrompt.versions[0]);
      } else if (referenceBy === 'Label' && newPrompt.labels?.length > 0) {
        setSelectedValue(newPrompt.labels[0]);
      } else {
        setSelectedValue('');
      }
    }
  };

  const handleReferenceByChange = (e) => {
    const newType = e.target.value;
    setReferenceBy(newType);

    if (selectedPromptObject) {
      if (newType === 'Version' && selectedPromptObject.versions?.length > 0) {
        setSelectedValue(selectedPromptObject.versions[0]);
      } else if (newType === 'Label' && selectedPromptObject.labels?.length > 0) {
        setSelectedValue(selectedPromptObject.labels[0]);
      } else {
        setSelectedValue('');
      }
    }
  };

  const handleInsert = () => {
    if (referenceTag) {
      onInsert(referenceTag);
      onClose();
    }
  };


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ... (Header, Description 부분은 기존과 동일) ... */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add inline prompt reference</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>
        <p className={styles.description}>
          Referenced prompts are dynamically resolved and inserted when fetched via API/SDK. This enables modular design—create complex prompts from reusable, independently maintained components.
        </p>

        {/* Prompt Name Dropdown */}
        <div className={styles.formGroup}>
          <label htmlFor="prompt-name" className={styles.label}>Prompt name</label>
          <select id="prompt-name" className={styles.select} value={selectedPromptName} onChange={handlePromptNameChange} disabled={isLoading || prompts.length === 0}>
            {isLoading ? <option>Loading...</option> :
              prompts.length > 0 ? prompts.map(p => <option key={p.name} value={p.name}>{p.name}</option>) :
                <option>No text prompts found</option>
            }
          </select>
          <p className={styles.subLabel}>Only text prompts can be referenced inline.</p>
        </div>

        {/* Reference by & Conditional Dropdowns */}
        {selectedPromptObject && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="reference-by" className={styles.label}>Reference by</label>
              <select id="reference-by" className={styles.select} value={referenceBy} onChange={handleReferenceByChange}>
                <option value="Version">Version</option>
                <option value="Label">Label</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reference-value" className={styles.label}>{referenceBy}</label>
              <div className={styles.valueSelector}>
                <select id="reference-value" className={styles.select} value={selectedValue} onChange={e => setSelectedValue(e.target.value)} disabled={!selectedValue && (referenceBy === 'Version' ? selectedPromptObject.versions?.length === 0 : selectedPromptObject.labels?.length === 0)}>
                  <option value="">Select a {referenceBy.toLowerCase()}</option>
                  {referenceBy === 'Version' ?
                    (selectedPromptObject.versions?.map(v => <option key={v} value={v}>{v}</option>)) :
                    (selectedPromptObject.labels?.map(l => <option key={l} value={l}>{l}</option>))
                  }
                </select>
                <button className={styles.linkButton}><ExternalLink size={16} /></button>
              </div>
            </div>
          </>
        )}

        {/* ▼▼▼ [추가] Tag Preview 섹션 ▼▼▼ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Tag preview</label>
          <div className={styles.tagDisplay}>
            <pre>{referenceTag}</pre>
            <button onClick={() => navigator.clipboard.writeText(referenceTag)} className={styles.copyButton}>
              <Clipboard size={16} />
            </button>
          </div>
          <p className={styles.subLabel}>This tag will be inserted into the prompt content.</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={handleInsert} className={styles.insertButton} disabled={!referenceTag}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptsReference;