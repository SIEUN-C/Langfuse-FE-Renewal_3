// src/Pages/Prompts/NewExperimentModal.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './NewExperimentModal.module.css';
// --- ▼▼▼ [수정] Search 아이콘을 lucide-react에서 가져옵니다. ▼▼▼ ---
import { X, ChevronDown, Check, ExternalLink, Search } from 'lucide-react';
// --- ▲▲▲ [수정] 완료 ▲▲▲ ---
import useProjectId from '../../hooks/useProjectId';
import { fetchAllPromptNames, fetchVersionsForPrompt, fetchLlmConnections } from './NewExperimentModalApi';
import Modal from '../../components/Modal/Modal';
import NewLLMConnectionsForm from '../Settings/form/NewLLMConnectionsForm';
import { saveLlmConnection } from '../../api/Settings/LLMApi';
import { publicKey, secretKey } from '../../lib/langfuse';
import ModelAdvancedSettingsPopover from './ModelAdvancedSettingsPopover';

const NewExperimentModal = ({ isOpen, onClose, onSubmit, promptName, promptVersion }) => {
  const [experimentName, setExperimentName] = useState('');
  const [description, setDescription] = useState('');
  const [allPrompts, setAllPrompts] = useState([]);
  const [availableVersions, setAvailableVersions] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(promptName);
  const [selectedVersion, setSelectedVersion] = useState(promptVersion);

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isProviderDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerRef = useRef(null);
  
  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);
  const [datasets] = useState(['Select a dataset', 'dataset-1', 'dataset-2']);
  
  // --- ▼▼▼ Model name 커스텀 드롭다운을 위한 state 및 ref (기존 코드 유지) ▼▼▼ ---
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelRef = useRef(null); 

  const { projectId } = useProjectId();
  
  const DEFAULT_SETTINGS = { temperature: 0.7, maxTokens: 1024, topP: 1.0 };
  const [modelSettings, setModelSettings] = useState(DEFAULT_SETTINGS);
  const [isAdvancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const settingsButtonRef = useRef(null);

  // --- ▼▼▼ [추가] 프롬프트 검색 기능과 커스텀 드롭다운을 위한 상태 및 ref를 추가합니다. ▼▼▼ ---
  const [promptSearchQuery, setPromptSearchQuery] = useState('');
  const [isPromptDropdownOpen, setPromptDropdownOpen] = useState(false);
  const promptDropdownRef = useRef(null);
  // --- ▲▲▲ [추가] 완료 ▲▲▲ ---

  const handleSettingChange = (key, value) => {
    setModelSettings(prev => ({ ...prev, [key]: value }));
  };

  const refreshConnections = async () => {
    if (projectId) {
      const connections = await fetchLlmConnections(projectId);
      setProviders(connections);
    }
  };

  const handleSaveConnection = async (connectionData) => {
    try {
      const base64Credentials = publicKey && secretKey ? btoa(`${publicKey}:${secretKey}`) : '';
      await saveLlmConnection(connectionData, base64Credentials);
      setIsLlmModalOpen(false);
      await refreshConnections();
      alert('LLM Connection이 성공적으로 추가되었습니다.');
    } catch (e) {
      console.error(`LLM 연결 저장에 실패했습니다:`, e);
      alert(`요청 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  
  useEffect(() => {
    if (isOpen && projectId) {
      const loadInitialData = async () => {
        const [promptNames, connections] = await Promise.all([
          fetchAllPromptNames(),
          fetchLlmConnections(projectId)
        ]);
        setAllPrompts(promptNames);
        setProviders(connections);
        if (connections.length > 0) {
          setSelectedProvider(connections[0].id);
        }
      };
      loadInitialData();
      setExperimentName('');
      setDescription('');
      setSelectedPrompt(promptName);
      setSelectedVersion(promptVersion);
    }
  }, [isOpen, promptName, promptVersion, projectId]);

  useEffect(() => {
    if (selectedPrompt) {
      const loadVersions = async () => {
        const versions = await fetchVersionsForPrompt(selectedPrompt);
        setAvailableVersions(versions.sort((a, b) => b - a));
        if (!versions.includes(Number(selectedVersion))) {
            setSelectedVersion(versions[0] || '');
        }
      };
      loadVersions();
    }
  }, [selectedPrompt, selectedVersion]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // --- ▼▼▼ [수정] 프롬프트 드롭다운 외부 클릭 감지 로직을 추가합니다. ▼▼▼ ---
      if (promptDropdownRef.current && !promptDropdownRef.current.contains(event.target)) {
        setPromptDropdownOpen(false);
      }
      // --- ▲▲▲ [수정] 완료 ▲▲▲ ---
      if (providerRef.current && !providerRef.current.contains(event.target)) {
        setProviderDropdownOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedProviderObject = providers.find(p => p.id === selectedProvider);
  
  const availableModels = useMemo(() => {
    if (!selectedProviderObject) return [];
    return selectedProviderObject.customModels || [];
  }, [selectedProviderObject]);
  
  // --- ▼▼▼ [추가] 검색어에 따라 프롬프트 목록을 필터링하는 로직을 추가합니다. ▼▼▼ ---
  const filteredPrompts = useMemo(() => {
    if (!promptSearchQuery) {
      return allPrompts;
    }
    return allPrompts.filter(p =>
      p.toLowerCase().includes(promptSearchQuery.toLowerCase())
    );
  }, [allPrompts, promptSearchQuery]);
  // --- ▲▲▲ [추가] 완료 ▲▲▲ ---

  useEffect(() => {
    if (availableModels.length > 0) {
      if (!availableModels.includes(selectedModel)) {
        setSelectedModel(availableModels[0]);
      }
    } else {
      setSelectedModel('');
    }
  }, [selectedProviderObject, availableModels, selectedModel]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log({
      experimentName,
      description,
      prompt: selectedPrompt,
      version: selectedVersion,
      providerId: selectedProvider,
      model: selectedModel,
      modelParameters: modelSettings,
    });
    onSubmit();
  };
  
  const handleVersionChange = (e) => {
    setSelectedVersion(Number(e.target.value));
  };

  // --- ▼▼▼ [수정] 기존 handlePromptChange 함수를 커스텀 드롭다운에 맞게 수정합니다. ▼▼▼ ---
  const handlePromptSelect = (promptName) => {
    setSelectedPrompt(promptName);
    setPromptDropdownOpen(false); // 항목 선택 시 드롭다운 닫기
  };
  // --- ▲▲▲ [수정] 완료 ▲▲▲ ---

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>New Dataset Run</h2>
              <p className={styles.subtitle}>
                Create a dataset run to test a prompt version on a dataset.
                <a href="#" className={styles.docLink}>See documentation</a> to learn more.
              </p>
            </div>
            <button type="button" onClick={onClose} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.body}>
            <div className={styles.formGroup}>
              <label htmlFor="experiment-name">Experiment name (optional)</label>
              <input
                id="experiment-name"
                type="text"
                className={styles.input}
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                className={styles.textarea}
                rows="3"
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prompt</h3>
              <div className={styles.inlineGroup}>
                {/* --- ▼▼▼ [수정] 기존 select를 커스텀 드롭다운으로 교체합니다. ▼▼▼ --- */}
                <div className={styles.customSelectContainer} ref={promptDropdownRef} style={{ flex: 2 }}>
                  <button
                    className={styles.selectButton}
                    onClick={() => setPromptDropdownOpen(prev => !prev)}
                  >
                    <span>{selectedPrompt || "Select a prompt"}</span>
                    <ChevronDown size={16} className={styles.selectIcon} />
                  </button>
                  {isPromptDropdownOpen && (
                    <div className={`${styles.dropdownMenu} ${styles.promptDropdownMenu}`}>
                      <div className={styles.dropdownSearchContainer}>
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Search prompts..."
                          className={styles.dropdownSearchInput}
                          value={promptSearchQuery}
                          onChange={(e) => setPromptSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className={styles.dropdownList}>
                        {filteredPrompts.map(p => (
                          <div
                            key={p}
                            className={styles.dropdownItem}
                            onClick={() => handlePromptSelect(p)}
                          >
                            {p}
                            {selectedPrompt === p && <Check size={16} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* --- ▲▲▲ [수정] 완료 ▲▲▲ --- */}

                <div className={styles.selectWrapper} style={{ flex: 1 }}>
                  <select
                    className={styles.select}
                    value={selectedVersion}
                    onChange={handleVersionChange}
                    disabled={availableVersions.length === 0}
                  >
                    {availableVersions.map(v => <option key={v} value={v}>Version {v}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div style={{ position: 'relative' }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Model</h3>
                  <button
                    ref={settingsButtonRef}
                    className={styles.iconButton}
                    title="Model Advanced Settings"
                    onClick={() => setAdvancedSettingsOpen(prev => !prev)}
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
                
                <ModelAdvancedSettingsPopover
                  open={isAdvancedSettingsOpen}
                  onClose={() => setAdvancedSettingsOpen(false)}
                  anchorRef={settingsButtonRef}
                  settings={modelSettings}
                  onSettingChange={handleSettingChange}
                  onReset={() => setModelSettings(DEFAULT_SETTINGS)}
                  apiKeyDisplayValue={selectedProviderObject?.displaySecretKey}
                />
              </div>
              
              <div className={styles.formRow}>
                <label>Provider</label>
                <div className={styles.customSelectContainer} ref={providerRef}>
                    <button
                        className={styles.selectButton}
                        onClick={() => setProviderDropdownOpen(prev => !prev)}
                    >
                        <span>{selectedProviderObject?.provider ?? "Select a provider"}</span>
                        <ChevronDown size={16} className={styles.selectIcon} />
                    </button>
                    {isProviderDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                        {providers.map(p => (
                            <div
                            key={p.id}
                            className={styles.dropdownItem}
                            onClick={() => {
                                setSelectedProvider(p.id);
                                setProviderDropdownOpen(false);
                            }}
                            >
                            {p.provider ?? p.id}
                            {selectedProvider === p.id && <Check size={16} />}
                            </div>
                        ))}
                        <div className={styles.dropdownDivider}></div>
                        <div
                            className={`${styles.dropdownItem} ${styles.actionItem}`}
                            onClick={() => {
                            setIsLlmModalOpen(true);
                            setProviderDropdownOpen(false);
                            }}
                        >
                            + Add LLM Connection
                        </div>
                        </div>
                    )}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <label>Model name</label>
                <div className={styles.customSelectContainer} ref={modelRef}>
                  <button
                    className={styles.selectButton}
                    onClick={() => setModelDropdownOpen(prev => !prev)}
                    disabled={!selectedProviderObject}
                  >
                    <span>{selectedModel || (availableVersions.length > 0 ? "Select a model" : "No models available")}</span>
                    <ChevronDown size={16} className={styles.selectIcon} />
                  </button>
                  
                  {isModelDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {availableModels.map(modelName => (
                        <div
                          key={modelName}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSelectedModel(modelName);
                            setModelDropdownOpen(false);
                          }}
                        >
                          {modelName}
                          {selectedModel === modelName && <Check size={16} />}
                        </div>
                      ))}
                      <div className={styles.dropdownDivider}></div>
                      <div
                        className={`${styles.dropdownItem} ${styles.actionItem}`}
                        onClick={() => {
                          setIsLlmModalOpen(true);
                          setModelDropdownOpen(false);
                        }}
                      >
                        + Add LLM Connection
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Dataset (expected columns)</h3>
              <div className={styles.selectWrapper}>
                <select className={styles.select}>
                  {datasets.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Evaluators</h3>
              <p className={styles.evaluatorInfo}>Select a dataset first to set up evaluators.</p>
            </div>
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.createButton} onClick={handleSubmit}>
              Create
            </button>
          </div>
        </div>
      </div>
      
      <Modal
        title="New LLM Connection"
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
      >
        <NewLLMConnectionsForm 
          onSave={handleSaveConnection}
          onClose={() => setIsLlmModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default NewExperimentModal;



//playground팀 소스 합체 완료 ver. 아직 프롬프트 검색 기능 없음
// // src/Pages/Prompts/NewExperimentModal.jsx

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import styles from './NewExperimentModal.module.css';
// import { X, ChevronDown, Check, ExternalLink } from 'lucide-react';
// import useProjectId from '../../hooks/useProjectId';
// import { fetchAllPromptNames, fetchVersionsForPrompt, fetchLlmConnections } from './NewExperimentModalApi';
// import Modal from '../../components/Modal/Modal';
// import NewLLMConnectionsForm from '../Settings/form/NewLLMConnectionsForm';
// import { saveLlmConnection } from '../../api/Settings/LLMApi';
// import { publicKey, secretKey } from '../../lib/langfuse';
// import ModelAdvancedSettingsPopover from './ModelAdvancedSettingsPopover';

// const NewExperimentModal = ({ isOpen, onClose, onSubmit, promptName, promptVersion }) => {
//   const [experimentName, setExperimentName] = useState('');
//   const [description, setDescription] = useState('');
//   const [allPrompts, setAllPrompts] = useState([]);
//   const [availableVersions, setAvailableVersions] = useState([]);
//   const [selectedPrompt, setSelectedPrompt] = useState(promptName);
//   const [selectedVersion, setSelectedVersion] = useState(promptVersion);

//   const [providers, setProviders] = useState([]);
//   const [selectedProvider, setSelectedProvider] = useState('');
//   const [isProviderDropdownOpen, setProviderDropdownOpen] = useState(false);
//   const providerRef = useRef(null);
  
//   const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);
//   const [datasets] = useState(['Select a dataset', 'dataset-1', 'dataset-2']);
  
//   const [selectedModel, setSelectedModel] = useState('');
//   const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
//   const modelRef = useRef(null); 

//   const { projectId } = useProjectId();
  
//   const DEFAULT_SETTINGS = {
//     useTemperature: true,
//     useTopP: false,
//     useMaxTokens: false,
//     temperature: 0.7,
//     maxTokens: 1024,
//     topP: 1.0,
//     additionalOptions: false,
//   };
//   const [modelSettings, setModelSettings] = useState(DEFAULT_SETTINGS);
  
//   const [isAdvancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
//   const settingsButtonRef = useRef(null);

//   // --- ▼▼▼ [수정] 이 함수의 로직을 변경하여 문제를 해결합니다. ▼▼▼ ---
//   // 기존: handleSettingChange = (key, value) => ...
//   // 변경: handleSettingChange = (newSettingsObject) => ...
//   // 이제 자식 컴포넌트가 전달하는 새로운 설정 객체 전체를 받아 상태를 업데이트합니다.
//   const handleSettingChange = (newSettings) => {
//     setModelSettings(newSettings);
//   };
//   // --- ▲▲▲ [수정] 완료 ▲▲▲ ---

//   const refreshConnections = async () => {
//     if (projectId) {
//       const connections = await fetchLlmConnections(projectId);
//       setProviders(connections);
//     }
//   };

//   const handleSaveConnection = async (connectionData) => {
//     try {
//       const base64Credentials = publicKey && secretKey ? btoa(`${publicKey}:${secretKey}`) : '';
//       await saveLlmConnection(connectionData, base64Credentials);
//       setIsLlmModalOpen(false);
//       await refreshConnections();
//       alert('LLM Connection이 성공적으로 추가되었습니다.');
//     } catch (e) {
//       console.error(`LLM 연결 저장에 실패했습니다:`, e);
//       alert(`요청 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`);
//     }
//   };
  
//   useEffect(() => {
//     if (isOpen && projectId) {
//       const loadInitialData = async () => {
//         const [promptNames, connections] = await Promise.all([
//           fetchAllPromptNames(),
//           fetchLlmConnections(projectId)
//         ]);
//         setAllPrompts(promptNames);
//         setProviders(connections);
//         if (connections.length > 0) {
//           setSelectedProvider(connections[0].id);
//         }
//       };
//       loadInitialData();
//       setExperimentName('');
//       setDescription('');
//       setSelectedPrompt(promptName);
//       setSelectedVersion(promptVersion);
//     }
//   }, [isOpen, promptName, promptVersion, projectId]);

//   useEffect(() => {
//     if (selectedPrompt) {
//       const loadVersions = async () => {
//         const versions = await fetchVersionsForPrompt(selectedPrompt);
//         setAvailableVersions(versions.sort((a, b) => b - a));
//         if (!versions.includes(Number(selectedVersion))) {
//             setSelectedVersion(versions[0] || '');
//         }
//       };
//       loadVersions();
//     }
//   }, [selectedPrompt, selectedVersion]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (providerRef.current && !providerRef.current.contains(event.target)) {
//         setProviderDropdownOpen(false);
//       }
//       if (modelRef.current && !modelRef.current.contains(event.target)) {
//         setModelDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const selectedProviderObject = providers.find(p => p.id === selectedProvider);
  
//   const availableModels = useMemo(() => {
//     if (!selectedProviderObject) return [];
//     return selectedProviderObject.customModels || [];
//   }, [selectedProviderObject]);

//   useEffect(() => {
//     if (availableModels.length > 0) {
//       if (!availableModels.includes(selectedModel)) {
//         setSelectedModel(availableModels[0]);
//       }
//     } else {
//       setSelectedModel('');
//     }
//   }, [selectedProviderObject, availableModels, selectedModel]);

//   if (!isOpen) return null;

//   const handleSubmit = () => {
//     console.log({
//       experimentName,
//       description,
//       prompt: selectedPrompt,
//       version: selectedVersion,
//       providerId: selectedProvider,
//       model: selectedModel,
//       modelParameters: modelSettings,
//     });
//     onSubmit();
//   };

//   const handlePromptChange = (e) => {
//     setSelectedPrompt(e.target.value);
//   };
  
//   const handleVersionChange = (e) => {
//     setSelectedVersion(Number(e.target.value));
//   };

//   return (
//     <>
//       <div className={styles.overlay} onClick={onClose}>
//         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//           <div className={styles.header}>
//             <div>
//               <h2 className={styles.title}>New Dataset Run</h2>
//               <p className={styles.subtitle}>
//                 Create a dataset run to test a prompt version on a dataset.
//                 <a href="#" className={styles.docLink}>See documentation</a> to learn more.
//               </p>
//             </div>
//             <button type="button" onClick={onClose} className={styles.closeButton}>
//               <X size={20} />
//             </button>
//           </div>
//           <div className={styles.body}>
//             <div className={styles.formGroup}>
//               <label htmlFor="experiment-name">Experiment name (optional)</label>
//               <input
//                 id="experiment-name"
//                 type="text"
//                 className={styles.input}
//                 value={experimentName}
//                 onChange={(e) => setExperimentName(e.target.value)}
//               />
//             </div>

//             <div className={styles.formGroup}>
//               <label htmlFor="description">Description (optional)</label>
//               <textarea
//                 id="description"
//                 className={styles.textarea}
//                 rows="3"
//                 placeholder="Add description..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//             </div>

//             <div className={styles.section}>
//               <h3 className={styles.sectionTitle}>Prompt</h3>
//               <div className={styles.inlineGroup}>
//                 <div className={styles.selectWrapper} style={{ flex: 2 }}>
//                   <select
//                     className={styles.select}
//                     value={selectedPrompt}
//                     onChange={handlePromptChange}
//                   >
//                     {allPrompts.map(p => <option key={p} value={p}>{p}</option>)}
//                   </select>
//                   <ChevronDown size={16} className={styles.selectIcon} />
//                 </div>
//                 <div className={styles.selectWrapper} style={{ flex: 1 }}>
//                   <select
//                     className={styles.select}
//                     value={selectedVersion}
//                     onChange={handleVersionChange}
//                     disabled={availableVersions.length === 0}
//                   >
//                     {availableVersions.map(v => <option key={v} value={v}>Version {v}</option>)}
//                   </select>
//                   <ChevronDown size={16} className={styles.selectIcon} />
//                 </div>
//               </div>
//             </div>

//             <div className={styles.section}>
//               <div style={{ position: 'relative' }}>
//                 <div className={styles.sectionHeader}>
//                   <h3 className={styles.sectionTitle}>Model</h3>
//                   <button
//                     ref={settingsButtonRef}
//                     className={styles.iconButton}
//                     title="Model Advanced Settings"
//                     onClick={() => setAdvancedSettingsOpen(prev => !prev)}
//                   >
//                     <ExternalLink size={16} />
//                   </button>
//                 </div>
                
//                 <ModelAdvancedSettingsPopover
//                   open={isAdvancedSettingsOpen}
//                   onClose={() => setAdvancedSettingsOpen(false)}
//                   anchorRef={settingsButtonRef}
//                   settings={modelSettings}
//                   onSettingChange={handleSettingChange}
//                   onReset={() => setModelSettings(DEFAULT_SETTINGS)}
//                   projectId={projectId}
//                   provider={selectedProviderObject?.provider}
//                 />
//               </div>
              
//               <div className={styles.formRow}>
//                 <label>Provider</label>
//                 <div className={styles.customSelectContainer} ref={providerRef}>
//                     <button
//                         className={styles.selectButton}
//                         onClick={() => setProviderDropdownOpen(prev => !prev)}
//                     >
//                         <span>{selectedProviderObject?.provider ?? "Select a provider"}</span>
//                         <ChevronDown size={16} className={styles.selectIcon} />
//                     </button>
//                     {isProviderDropdownOpen && (
//                         <div className={styles.dropdownMenu}>
//                         {providers.map(p => (
//                             <div
//                             key={p.id}
//                             className={styles.dropdownItem}
//                             onClick={() => {
//                                 setSelectedProvider(p.id);
//                                 setProviderDropdownOpen(false);
//                             }}
//                             >
//                             {p.provider ?? p.id}
//                             {selectedProvider === p.id && <Check size={16} />}
//                             </div>
//                         ))}
//                         <div className={styles.dropdownDivider}></div>
//                         <div
//                             className={`${styles.dropdownItem} ${styles.actionItem}`}
//                             onClick={() => {
//                             setIsLlmModalOpen(true);
//                             setProviderDropdownOpen(false);
//                             }}
//                         >
//                             + Add LLM Connection
//                         </div>
//                         </div>
//                     )}
//                 </div>
//               </div>
              
//               <div className={styles.formRow}>
//                 <label>Model name</label>
//                 <div className={styles.customSelectContainer} ref={modelRef}>
//                   <button
//                     className={styles.selectButton}
//                     onClick={() => setModelDropdownOpen(prev => !prev)}
//                     disabled={!selectedProviderObject}
//                   >
//                     <span>{selectedModel || (availableModels.length > 0 ? "Select a model" : "No models available")}</span>
//                     <ChevronDown size={16} className={styles.selectIcon} />
//                   </button>
                  
//                   {isModelDropdownOpen && (
//                     <div className={styles.dropdownMenu}>
//                       {availableModels.map(modelName => (
//                         <div
//                           key={modelName}
//                           className={styles.dropdownItem}
//                           onClick={() => {
//                             setSelectedModel(modelName);
//                             setModelDropdownOpen(false);
//                           }}
//                         >
//                           {modelName}
//                           {selectedModel === modelName && <Check size={16} />}
//                         </div>
//                       ))}
//                       <div className={styles.dropdownDivider}></div>
//                       <div
//                         className={`${styles.dropdownItem} ${styles.actionItem}`}
//                         onClick={() => {
//                           setIsLlmModalOpen(true);
//                           setModelDropdownOpen(false);
//                         }}
//                       >
//                         + Add LLM Connection
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.section}>
//               <h3 className={styles.sectionTitle}>Dataset (expected columns)</h3>
//               <div className={styles.selectWrapper}>
//                 <select className={styles.select}>
//                   {datasets.map(d => <option key={d} value={d}>{d}</option>)}
//                 </select>
//                 <ChevronDown size={16} className={styles.selectIcon} />
//               </div>
//             </div>

//             <div className={styles.section}>
//               <h3 className={styles.sectionTitle}>Evaluators</h3>
//               <p className={styles.evaluatorInfo}>Select a dataset first to set up evaluators.</p>
//             </div>
//           </div>
//           <div className={styles.footer}>
//             <button type="button" className={styles.createButton} onClick={handleSubmit}>
//               Create
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <Modal
//         title="New LLM Connection"
//         isOpen={isLlmModalOpen}
//         onClose={() => setIsLlmModalOpen(false)}
//       >
//         <NewLLMConnectionsForm 
//           onSave={handleSaveConnection}
//           onClose={() => setIsLlmModalOpen(false)}
//         />
//       </Modal>
//     </>
//   );
// };

// export default NewExperimentModal;


