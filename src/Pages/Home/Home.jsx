import { useNavigate } from "react-router-dom";
import TopFilters from "../../components/TopFilters";
import DashboardCard from "components/Card/Card";
import TraceChart from "components/Chart/TraceChart";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* 상단 필터바 */}
      <TopFilters />

      {/* 카드 섹션 */}
      <div className={styles.cardRow}>
        <DashboardCard title="Traces" onClick={() => navigate("/trace")}>
          {/* ^^^ '/tracing' → '/trace' 로 수정 (정의된 라우트에 맞춤) */}
          <div className={styles.metric}>0</div>
          <p className={styles.sub}>Total traces tracked</p>
          <div className={styles.tag}>qa</div>
        </DashboardCard>

        <DashboardCard
          title="Model Cost"
          onClick={() => navigate("/dashboards/llm")}
          // ^^^ '/cost' 라우트가 없어서 대시보드 페이지로 연결 (존재하는 경로)
        >
          <div className={styles.metric}>$0.00</div>
          <p className={styles.sub}>Total cost</p>
        </DashboardCard>

        <DashboardCard title="Scores" onClick={() => navigate("/scores")}>
          <div className={styles.metric}>0</div>
          <p className={styles.sub}>Total scores tracked</p>
        </DashboardCard>
      </div>

      {/* 차트 섹션 */}
      <div className={styles.chartSection}>
        <TraceChart />
      </div>
    </div>
  );
}