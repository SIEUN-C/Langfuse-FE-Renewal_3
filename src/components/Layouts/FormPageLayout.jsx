import React from 'react';
import styles from './FormPageLayout.module.css';

const FormPageLayout = ({
  breadcrumbs,
  children,
  onSave,
  onCancel,
  isSaveDisabled = false,
  saveError, // 1. prop 추가
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>{breadcrumbs}</div>
      <div className={styles.form}>{children}</div>
      <div className={styles.actions}>
        {/* 2. 오류 메시지가 있을 때만 p 태그를 보여줌 */}
        {saveError && <p className={styles.errorMessage}>{saveError}</p>}
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.saveButton} onClick={onSave} disabled={isSaveDisabled}>
          Save
        </button>
      </div>
    </div>
  );
};

export default FormPageLayout;