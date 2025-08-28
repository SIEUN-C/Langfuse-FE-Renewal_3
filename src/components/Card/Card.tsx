import styles from './Card.module.css';

type CardProps = {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export default function Card({ title, onClick, children }: CardProps) {
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
