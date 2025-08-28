import styles from './Card.module.css';

export default function Card({ title, onClick, children }) {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <h3 className={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}