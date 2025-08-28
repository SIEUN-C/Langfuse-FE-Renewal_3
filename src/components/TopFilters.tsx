// src/components/TopFilters.tsx
import styles from './TopFilters.module.css';
import { Calendar, Filter, SlidersHorizontal } from 'lucide-react';

export default function TopFilters() {
  return (
    <div className={styles.topFilters}>
      <div className={styles.left}>
        <button className={styles.filterBtn}><Calendar size={16} /> Aug 06 ~ Aug 07</button>
        <button className={styles.filterBtn}>Past 24 hours</button>
        <button className={styles.filterBtn}>Env: default</button>
        <button className={styles.filterBtn}><Filter size={14} /> Filters</button>
      </div>
      <div className={styles.right}>
        <button className={styles.requestChart}><SlidersHorizontal size={16} /> Request Chart</button>
      </div>
    </div>
  );
}
