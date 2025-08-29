// src/Pages/Prompts/Prompts.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'; // useCallback 추가
import { Link, useNavigate } from 'react-router-dom';
import styles from './Prompts.module.css';
import useProjectId from 'hooks/useProjectId';
import {
  Info,
  Plus,
  ChevronDown,
  FileText,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Tag,
} from 'lucide-react';
import { fetchPrompts, deletePrompt, updatePromptTags } from './promptsApi.js';
import SearchInput from '../../components/SearchInput/SearchInput.jsx';
import { useSearch } from '../../hooks/useSearch.js';

//--- TagEditor 컴포넌트를 Prompts.jsx 파일 내부에 직접 정의 ---
const TagEditor = ({ promptName, tags, onSave, onClose, anchorEl, projectId }) => {
  const [currentTags, setCurrentTags] = useState(tags || []);
  const [inputValue, setInputValue] = useState('');
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 125 + (rect.width / 2),
      });
    }
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && !anchorEl.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorEl]);


  const saveTagsToApi = useCallback(async (tagsToSave) => {
    try {
      // [수정] updatePromptTags 호출 시 projectId를 전달합니다. (이미 props로 받고 있음)
      await updatePromptTags(promptName, tagsToSave, projectId);
      onSave(tagsToSave);
    } catch (error) {
      alert(`Failed to save tags: ${error.message}`);
      console.error(error);
    }
  }, [promptName, projectId, onSave]);


  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!currentTags.includes(newTag)) {
        const updatedTags = [...currentTags, newTag];
        setCurrentTags(updatedTags);
        setInputValue('');
        await saveTagsToApi(updatedTags);
      } else {
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && currentTags.length > 0) {
      e.preventDefault();
      const updatedTags = currentTags.slice(0, -1);
      setCurrentTags(updatedTags);
      await saveTagsToApi(updatedTags);
    }
  };

  const removeTag = async (tagToRemove) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    await saveTagsToApi(updatedTags);
  };

  if (!anchorEl) return null;

  return (
    <div ref={popoverRef} className={styles.tagEditorPopover} style={position}>
      <div className={styles.tagEditorHeader}>
        <span className={styles.tagEditorTitle}>Prompt Tags</span>
      </div>
      <div className={styles.tagInputContainer}>
        {currentTags.map(tag => (
          <span key={tag} className={styles.tagEditorTag}>
            {tag}
            <button onClick={() => removeTag(tag)} className={styles.removeTagBtn}>×</button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentTags.length === 0 ? "Add tags..." : ""}
          className={styles.tagEditorInput}
          autoFocus
        />
      </div>
      {/* Save 버튼이 있던 footer 제거 */}
      {/* <div className={styles.tagEditorFooter}>
        <button onClick={handleSave} className={styles.saveButton}>Save</button>
      </div> */}
    </div>
  );
};

const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [promptToDelete, setPromptToDelete] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [tagEditorAnchor, setTagEditorAnchor] = useState(null);

  const [searchType, setSearchType] = useState('Names, Tags');
  const { searchQuery, setSearchQuery, filteredData: filteredPrompts } = useSearch(prompts, searchType);

  // [수정] useProjectId 훅에서 projectId 값을 구조분해 할당으로 가져옵니다.
  const { projectId } = useProjectId();

  useEffect(() => {
    // [수정] projectId가 아직 로드되지 않았다면 API 호출을 시도하지 않습니다.
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // [수정] fetchPrompts 호출 시 현재 projectId를 인자로 전달합니다.
        const formattedPrompts = await fetchPrompts(projectId);
        setPrompts(formattedPrompts);
      } catch (err) {
        console.error("Failed to fetch prompts:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [projectId]); // [수정] projectId가 변경될 때마다 프롬프트 목록을 다시 불러오도록 의존성 배열에 추가합니다.

  const navigateToNewPrompts = () => {
    navigate("/prompts/new");
  };

  const formatObservations = (num) => {
    if (num > 999) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num;
  };

  const handleDeleteClick = (prompt) => {
    setPromptToDelete(prev => (prev?.id === prompt.id ? null : prompt));
  };

  const handleTagClick = (e, prompt) => {
    e.stopPropagation();
    if (editingPrompt && editingPrompt.id === prompt.id) {
      setEditingPrompt(null);
      setTagEditorAnchor(null);
    } else {
      setTagEditorAnchor(e.currentTarget);
      setEditingPrompt(prompt);
    }
  };

  const handleSaveTags = (newTags) => {
    if (!editingPrompt) return;
    setPrompts(prompts.map(p =>
      p.id === editingPrompt.id ? { ...p, tags: newTags } : p
    ));
  };

  const confirmDelete = async () => {
    if (!promptToDelete) return;

    try {
      // [수정] deletePrompt 호출 시 prompt 이름과 현재 projectId를 함께 전달합니다.
      await deletePrompt(promptToDelete.name, projectId);
      setPrompts(currentPrompts => currentPrompts.filter(p => p.id !== promptToDelete.id));
      console.log(`프롬프트 "${promptToDelete.name}"가 성공적으로 삭제되었습니다.`);
      setPromptToDelete(null);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>Prompts</h1>
          <Info size={16} className={styles.infoIcon} />
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} onClick={navigateToNewPrompts}>
            <Plus size={16} /> New prompt
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <SearchInput
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          searchType={searchType}
          setSearchType={setSearchType}
          searchTypes={['Names, Tags', 'Full Text']}
        />
        <button className={styles.filterButton}>Filters</button>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Versions</th>
              <th>Type</th>
              <th>Latest Version Created At <ChevronDown size={14} /></th>
              <th>Number of Observations</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading prompts...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'red' }}>{error}</td></tr>
            ) : (
              filteredPrompts.map((prompt) => (
                <React.Fragment key={prompt.id}>
                  <tr>
                    <td>
                      <div className={styles.nameCell}>
                        <FileText size={18} />
                        <Link to={`/prompts/${prompt.id}`} className={styles.promptLink}>
                          {prompt.name}
                        </Link>
                      </div>
                    </td>
                    <td>{prompt.versions}</td>
                    <td>{prompt.type}</td>
                    <td>{prompt.latestVersionCreatedAt}</td>
                    <td><div className={styles.observationCell}>{formatObservations(prompt.observations)}</div></td>
                    <td>
                      <div className={styles.tagsCell}>
                        <button className={styles.iconButton} onClick={(e) => handleTagClick(e, prompt)}>
                          {prompt.tags && prompt.tags.length > 0 ? (
                            prompt.tags.map(tag => (
                              <span key={tag} className={styles.tagPill}>
                                {tag}
                              </span>
                            ))
                          ) : (
                            <Tag size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.iconButton} onClick={() => handleDeleteClick(prompt)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {promptToDelete && promptToDelete.id === prompt.id && (
                    <tr className={styles.confirmationRow}>
                      <td colSpan={7}>
                        <div className={styles.confirmationContainer}>
                          <div className={styles.confirmationContent}>
                            <h4 className={styles.confirmationTitle}>Please confirm</h4>
                            <p className={styles.confirmationText}>
                              This action permanently deletes this prompt. All requests to fetch prompt
                              <strong> {prompt.name} </strong> will error.
                            </p>
                          </div>
                          <button className={styles.deleteConfirmButton} onClick={confirmDelete}>
                            Delete Prompt
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.rowsPerPage}>
          <span>Rows per page</span>
          <select>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className={styles.pageInfo}>Page 1 of 1</div>
        <div className={styles.pageControls}>
          <button className={styles.iconButton} disabled><ChevronsLeft size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronLeft size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronRight size={18} /></button>
          <button className={styles.iconButton} disabled><ChevronsRight size={18} /></button>
        </div>
      </div>

      {/* TagEditor 렌더링 로직 */}
      {editingPrompt && (
        <TagEditor
          promptName={editingPrompt.name}
          tags={editingPrompt.tags}
          onSave={handleSaveTags}
          onClose={() => {
            setEditingPrompt(null);
            setTagEditorAnchor(null);
          }}
          anchorEl={tagEditorAnchor}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default Prompts;