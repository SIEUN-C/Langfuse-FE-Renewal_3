// src/Pages/Tracing/TraceDetailView.jsx
import React, { useState } from 'react';
import styles from './TraceDetailView.module.css';
import { Copy, List, Clipboard, Plus, SquarePen, ChevronDown, MessageSquare, Info } from 'lucide-react';
import Toast from '../../components/Toast/Toast';
import SidePanel from '../../components/SidePanel/SidePanel';
import Comments from '../../components/Comments/Comments';
import AddToDatasetModal from '../../components/AddToDatasetModal/AddToDatasetModal';
import { useComments } from '../../hooks/useComments';

// FormattedTable 컴포넌트
const FormattedTable = ({ data }) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return <pre>{data}</pre>;
  }
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className={styles.noDataText}>Empty object</p>;
  }
  return (
    <table className={styles.formattedTable}>
      <thead>
        <tr>
          <th>Path</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td className={styles.pathCell}>{key}</td>
            <td className={styles.valueCell}>
              {typeof value === 'string' ? `"${value}"` : String(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// 메인 TraceDetailView 컴포넌트
const TraceDetailView = ({ details, isLoading, error }) => {
  const [viewFormat, setViewFormat] = useState('Formatted');
  const [toastInfo, setToastInfo] = useState({ isVisible: false, message: '' });
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const isObservation = details && 'type' in details && 'traceId' in details;
  const objectType = isObservation ? 'OBSERVATION' : 'TRACE';
  const projectId = details?.projectId; // projectId 추출
  
  // useComments 훅을 사용하여 댓글 관련 상태와 함수를 가져옵니다.
  // [수정] useComments 훅에 projectId 전달
  const {
    comments,
    isLoading: isCommentsLoading,
    error: commentsError,
    addComment,
    removeComment,
  } = useComments(projectId, objectType, details?.id);

  // 댓글 추가 핸들러
  const handleAddComment = async (content) => {
    const result = await addComment(content);
    if (result.success) {
      setToastInfo({ isVisible: true, message: '댓글이 추가되었습니다.' });
    } else {
      alert(`오류: ${result.error}`);
    }
    return result; // [수정] Comments.jsx로 결과를 반환합니다.
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    const result = await removeComment(commentId);
    if (result.success) {
      setToastInfo({ isVisible: true, message: '댓글이 삭제되었습니다.' });
    } else {
      alert(`오류: ${result.error}`);
    }
    return result; // [수정] Comments.jsx로 결과를 반환합니다.
  };

  const handleCopy = (text, type) => {
    const textToCopy = typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setToastInfo({ isVisible: true, message: `${type}이(가) 클립보드에 복사되었습니다.` });
      })
      .catch(err => {
        console.error("복사에 실패했습니다.", err);
        setToastInfo({ isVisible: true, message: '복사에 실패했습니다.' });
      });
  };

  const renderFormattedContent = (data) => {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return <FormattedTable data={data} />;
    }
    return <pre>{String(data ?? 'null')}</pre>;
  };

  const renderContent = (title, data, type = 'default') => {
    const cardStyle = type === 'output' ? styles.outputCard : '';
    return (
      <div className={`${styles.contentCard} ${cardStyle}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <button className={styles.copyButton} onClick={() => handleCopy(data, title)} title="Copy content">
            <Copy size={14} />
          </button>
        </div>
        <div className={styles.cardBody}>
          {viewFormat === 'JSON'
            ? <pre>{JSON.stringify(data, null, 2)}</pre>
            : renderFormattedContent(data)
          }
        </div>
      </div>
    );
  };

  if (isLoading) return <div className={styles.body}>Loading details...</div>;
  if (error) return <div className={styles.body} style={{ color: 'red' }}>{error}</div>;
  if (!details) return <div className={styles.body}>No details available.</div>;

  const metadata = details.metadata ?? {};
  const name = details.name ?? 'N/A';
  const id = details.id;

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toISOString().replace('T', ' ').substring(0, 23);
  };

  const formatUsage = (usage) => {
    if (!usage || (usage.input == null && usage.output == null)) return null;
    const input = usage.input ?? 0;
    const output = usage.output ?? 0;
    const total = usage.total ?? (input + output);
    return `${input} prompt → ${output} completion (∑ ${total})`;
  };

  return (
    <div className={styles.body}>
      <Toast
        message={toastInfo.message}
        isVisible={toastInfo.isVisible}
        onClose={() => setToastInfo({ isVisible: false, message: '' })}
      />
      <div className={styles.infoBar}>
        <div className={styles.infoBarTop}>
          <div className={styles.infoBarTitle}>
            <List size={20} />
            <h2 className={styles.traceName}>{name}</h2>
            <button
              className={styles.idButton}
              title="Copy ID"
              onClick={() => handleCopy(id, 'ID')}
            >
              <Clipboard size={12} /> ID
            </button>
          </div>
          <div className={styles.infoBarActions}>
            {isObservation ? (
                <div className={styles.annotateButton}>
                    <button>Playground</button>
                    <div className={styles.annotateButtonChevron}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            ) : (
                <button
                  className={styles.actionButton}
                  onClick={() => setIsDatasetModalOpen(true)}
                >
                    <Plus size={14} /> Add to datasets
                </button>
            )}
            {/* Annotate 버튼 */}
            {/* {!isObservation && (
                 <div className={styles.annotateButton}>
                    <button>
                        <SquarePen size={14} /> Annotate
                    </button>
                    <div className={styles.annotateButtonChevron}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            )} */}
            <button
              className={`${styles.iconButton} ${styles.actionButtonSecondary}`}
              onClick={() => setIsCommentsOpen(true)}
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>
        <div className={styles.infoBarBottom}>
          <span className={styles.timestamp}>
            {formatTimestamp(isObservation ? details.startTime : details.timestamp)}
          </span>
          {isObservation ? (
            <>
              <div className={styles.pills}>
                {details.latency != null && (
                  <div className={`${styles.pill} ${styles.pillDark}`}>
                    Latency: {details.latency.toFixed(2)}s
                  </div>
                )}
                <div className={`${styles.pill} ${styles.pillDark}`}>
                  Env: {details.environment ?? 'default'}
                </div>
                {details.totalPrice != null && (
                  <div className={styles.costPill}>
                    ${details.totalPrice.toFixed(6)}
                    <Info size={14} className={styles.infoIcon} />
                  </div>
                )}
                {details.usage && formatUsage(details.usage) && (
                  <div className={styles.costPill}>
                    {formatUsage(details.usage)}
                    <Info size={14} className={styles.infoIcon} />
                  </div>
                )}
              </div>
              <div className={styles.pills}>
                {details.model && (
                  <div className={`${styles.pill} ${styles.pillDark}`}>{details.model}</div>
                )}
                {details.modelParameters && Object.entries(details.modelParameters).map(([key, value]) => (
                  <div key={key} className={`${styles.pill} ${styles.pillDark}`}>
                    {key}: {String(value)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.pills}>
                {details.sessionId && (
                  <div className={`${styles.pill} ${styles.pillDark}`}>
                    Session: {details.sessionId}
                  </div>
                )}
                {details.userId && (
                  <div className={`${styles.pill} ${styles.pillUser}`}>
                    User ID: {details.userId}
                  </div>
                )}
                <div className={`${styles.pill} ${styles.pillDark}`}>
                  Env: {details.environment ?? 'default'}
                </div>
                {details.latency != null && (
                  <div className={`${styles.pill} ${styles.pillDark}`}>
                    Latency: {details.latency.toFixed(2)}s
                  </div>
                )}
              </div>
              <div className={styles.costBar}>
                {details.cost != null && (
                  <div className={styles.costPill}>
                    Total Cost: ${details.cost.toFixed(6)}
                    <Info size={14} className={styles.infoIcon} />
                  </div>
                )}
                <div className={styles.costPill}>
                  8 → 6 (∑ 14)
                  <Info size={14} className={styles.infoIcon} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.formatToggle}>
        <button
          className={`${styles.toggleButton} ${viewFormat === 'Formatted' ? styles.active : ''}`}
          onClick={() => setViewFormat('Formatted')}
        >
          Formatted
        </button>
        <button
          className={`${styles.toggleButton} ${viewFormat === 'JSON' ? styles.active : ''}`}
          onClick={() => setViewFormat('JSON')}
        >
          JSON
        </button>
      </div>

      {renderContent("Input", details.input, 'input')}
      {renderContent("Output", details.output, 'output')}
      {isObservation && details.modelParameters && renderContent("Model Parameters", details.modelParameters)}
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Metadata</h3>
        </div>
        <div className={styles.cardBody}>
          {Object.keys(metadata).length > 0
            ? (viewFormat === 'JSON'
              ? <pre>{JSON.stringify(metadata, null, 2)}</pre>
              : <FormattedTable data={metadata} />)
            : <p className={styles.noDataText}>No metadata available.</p>
          }
        </div>
      </div>

      <SidePanel
        title="Comments"
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      >
        <Comments
          comments={comments}
          isLoading={isCommentsLoading}
          error={commentsError}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </SidePanel>

      <AddToDatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        input={details?.input}
        output={details?.output}
        metadata={details?.metadata}
      />
    </div>
  );
};

export default TraceDetailView;