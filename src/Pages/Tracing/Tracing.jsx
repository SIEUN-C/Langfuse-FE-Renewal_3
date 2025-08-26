// src/pages/Tracing/Tracing.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './Tracing.module.css';
import { DataTable } from 'components/DataTable/DataTable';
import { traceTableColumns } from './traceColumns.jsx';
import SearchInput from 'components/SearchInput/SearchInput';
import FilterControls from 'components/FilterControls/FilterControls';
import TraceDetailPanel from './TraceDetailPanel.jsx';
import { useSearch } from '../../hooks/useSearch.js';
import ColumnVisibilityModal from './ColumnVisibilityModal.jsx';
import FilterButton from 'components/FilterButton/FilterButton';
import { Columns, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { createTrace, updateTrace } from './CreateTrace.jsx';
import { langfuse } from '../../lib/langfuse';
import { fetchTraces, deleteTrace } from './TracingApi';
import { fetchTraceDetails } from './TraceDetailApi'; // Trace 상세 정보를 가져오는 API 추가

const Tracing = () => {
  const [activeTab, setActiveTab] = useState('Traces');
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [traces, setTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('IDs / Names');
  const { searchQuery, setSearchQuery, filteredData: filteredTraces } = useSearch(traces, searchType);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [favoriteState, setFavoriteState] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [pendingTraceId, setPendingTraceId] = useState(null); // 새로 생성 중인 Trace ID를 추적하는 상태

  const toggleFavorite = useCallback((traceId) => {
    setFavoriteState(prev => ({ ...prev, [traceId]: !prev[traceId] }));
  }, []);

  const toggleAllFavorites = () => {
    const allFavorited = traces.length > 0 && traces.every(trace => favoriteState[trace.id]);
    const newFavoriteState = {};
    traces.forEach(trace => {
      newFavoriteState[trace.id] = !allFavorited;
    });
    setFavoriteState(newFavoriteState);
  };

  const [columns, setColumns] = useState(
    traceTableColumns.map(c => ({ ...c, visible: true }))
  );

  const loadTraces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTraces = await fetchTraces();
      setTraces(fetchedTraces);
      const initialFavorites = {};
      fetchedTraces.forEach(trace => {
        initialFavorites[trace.id] = trace.isFavorited || false;
      });
      setFavoriteState(initialFavorites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { loadTraces(); }, []);

  // 'New Trace' 버튼 클릭 핸들러 수정
  const handleCreateClick = async () => {
    const newTraceId = await createTrace();
    if (newTraceId) {
      setPendingTraceId(newTraceId); // 폴링을 시작하기 위해 pending 상태에 ID 설정
    }
  };

  const handleUpdateClick = async () => {
    const traceIdToUpdate = window.prompt("업데이트할 Trace의 ID를 입력하세요:");
    if (!traceIdToUpdate) return;
    const traceToUpdate = traces.find(t => t.id === traceIdToUpdate.trim());
    if (!traceToUpdate) {
      alert(`ID '${traceIdToUpdate}'에 해당하는 Trace를 찾을 수 없습니다.`);
      return;
    }
    const langfuseTraceObject = langfuse.trace({ id: traceToUpdate.id, _dangerouslyIgnoreCorruptData: true });
    await updateTrace(langfuseTraceObject, loadTraces);
  };

  const handleDeleteTrace = useCallback(async (traceId) => {
    if (window.confirm(`정말로 이 트레이스를 삭제하시겠습니까? ID: ${traceId}`)) {
      try {
        await deleteTrace(traceId);
        setTraces(prevTraces => prevTraces.filter(trace => trace.id !== traceId));
        alert('Trace가 성공적으로 삭제되었습니다.');
      } catch (err) {
        alert('Trace 삭제에 실패했습니다.');
        console.error(err);
      }
    }
  }, []);

  const handleRowClick = (trace) => setSelectedTrace(prev => (prev?.id === trace.id ? null : trace));
  const setAllColumnsVisible = (visible) => setColumns(prev => prev.map(col => ({ ...col, visible })));
  const toggleColumnVisibility = (key) => setColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  // pendingTraceId가 변경될 때마다 폴링 로직을 실행하는 useEffect
  useEffect(() => {
    if (!pendingTraceId) return;

    // "생성 중" 상태를 즉시 UI에 보여주기 위해 가짜 데이터를 목록 맨 앞에 추가
    setTraces(prevTraces => [
      { 
        id: pendingTraceId, 
        name: `Creating trace ${pendingTraceId.substring(0, 7)}...`, 
        timestamp: new Date().toLocaleString(), 
        input: 'Pending...', 
        output: 'Pending...',
        // 👇 필수 필드에 대한 기본값을 추가합니다.
        userId: '...',
        cost: null,
        latency: 0,
        observations: '...'
      },
      ...prevTraces,
    ]);

    const interval = setInterval(async () => {
      try {
        // 2초마다 해당 ID의 Trace가 생성되었는지 확인
        await fetchTraceDetails(pendingTraceId);
        
        // 성공적으로 조회되면, 폴링을 멈추고 전체 목록을 새로고침
        clearInterval(interval);
        setPendingTraceId(null);
        await loadTraces();
        console.log(`Trace ${pendingTraceId} has been confirmed and list updated.`);

      } catch (error) {
        // 아직 생성되지 않았거나 다른 오류 발생 시, 콘솔에 로그만 남기고 계속 폴링
        console.log(`Polling for trace ${pendingTraceId}... not found yet.`);
      }
    }, 2000); // 2초 간격으로 확인

    // 30초 후에도 확인되지 않으면 타임아웃 처리
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPendingTraceId(null);
      alert(`Trace ${pendingTraceId} 생성 확인에 실패했습니다. 목록을 수동으로 새로고침 해주세요.`);
      loadTraces(); // 실패하더라도 목록은 한 번 새로고침
    }, 30000);

    // 컴포넌트가 언마운트되거나 pendingTraceId가 바뀌면 인터벌과 타임아웃 정리
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingTraceId]); // loadTraces를 의존성 배열에서 제거


  return (
    <div className={styles.container}>
      <div className={styles.listSection}>
        
        <div className={styles.tabs}>
          <button className={`${styles.tabButton} ${activeTab === 'Traces' ? styles.active : ''}`} onClick={() => setActiveTab('Traces')}>Traces</button>
          <button className={`${styles.tabButton} ${activeTab === 'Observations' ? styles.active : ''}`} onClick={() => setActiveTab('Observations')}>Observations</button>
        </div>
        
        <div className={styles.filterBar}>
          <div className={styles.filterLeftGroup}>
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              searchType={searchType}
              setSearchType={setSearchType}
              searchTypes={['IDs / Names', 'Full Text']}
            />
            <FilterControls onRefresh={loadTraces} />
          </div>
          <div className={styles.filterRightGroup}>
            <FilterButton onClick={handleCreateClick}>
              <Plus size={16} /> New Trace
            </FilterButton>

            <FilterButton onClick={handleUpdateClick} style={{marginLeft: '8px'}}>
              <Edit size={16} /> Update Trace
            </FilterButton>

            <FilterButton onClick={() => setIsColumnModalOpen(true)} style={{marginLeft: '8px'}}>
              <Columns size={16} /> Columns ({visibleColumns.length}/{columns.length})
            </FilterButton>
          </div>
        </div>
        
        <div className={styles.contentArea}>
          {activeTab === 'Traces' && (
            isLoading ? <div>Loading traces...</div> : 
            error ? <div style={{ color: 'red' }}>Error: {error}</div> : 
            (
                <DataTable
                  columns={visibleColumns}
                  data={filteredTraces}
                  keyField="id"
                  renderEmptyState={() => <div>No traces found.</div>}
                  onRowClick={handleRowClick}
                  selectedRowKey={selectedTrace?.id || null}
                  showCheckbox={true}
                  selectedRows={selectedRows}
                  onCheckboxChange={setSelectedRows}
                  onFavoriteClick={toggleFavorite}
                  favoriteState={favoriteState}
                  onToggleAllFavorites={toggleAllFavorites}
                  showDelete={true}
                  onDeleteClick={handleDeleteTrace}
                />
            )
          )}
        </div>
      </div>

      {selectedTrace && ReactDOM.createPortal(
        <TraceDetailPanel
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />,
        document.body
      )}

      <ColumnVisibilityModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        setAllColumnsVisible={setAllColumnsVisible}
      />
    </div>
  );
};

export default Tracing;