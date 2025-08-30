// src/App.jsx
import React, { useState, useEffect } from 'react'; // useState와 useEffect를 import 해야 합니다.
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';

import Login from './Pages/Login/LoginPage'

import Home from './Pages/Home/Home';

import Tracing from './Pages/Tracing/Tracing';
import Sessions from './Pages/Tracing/Sessions/Sessions';
import SessionDetail from './Pages/Tracing/Sessions/SessionDetail';

import Prompts from './Pages/Prompts/Prompts';
import PromptsDetail from './Pages/Prompts/PromptsDetail';
import PromptsNew from './Pages/Prompts/PromptsNew';

import Playground from './Pages/Playground/Playground';

// ⭐ 추가: 게이트 컴포넌트 임포트
import ProjectGate from './components/ProjectId/ProjectGate';

// import JudgePage from './pages/Evaluation/Judge/JudgePage';

// import Dashboards from './pages/Dashboards/Dashboards';
// import DashboardNew from './pages/Dashboards/DashboardNew';
// import DashboardDetail from './pages/Dashboards/DashboardDetail';
// import WidgetNew from './pages/Dashboards/WidgetNew';

import SettingsPage from './Pages/Settings/SettingsPage';
import General from './Pages/Settings/General';
import ApiKeys from './Pages/Settings/ApiKeys';
import LLMConnections from "./Pages/Settings/LLMConnections";
import Models from './Pages/Settings/Models';
import Members from './Pages/Settings/Members';
import Scores from './Pages/Settings/Scores';

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // 앱이 처음 실행될 때 딱 한 번만 실행됨
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        // 응답 데이터에 내용이 있으면(로그인 상태이면) session 상태에 저장
        if (data && Object.keys(data).length > 0) {
          setSession(data);
        }
      } catch (error) {
        console.error("세션 확인 실패:", error);
      } finally {
        // 확인이 끝나면 로딩 상태를 false로 변경
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // 로딩 중일 때는 아무것도 안 보여주거나 로딩 스피너를 보여줌
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
    <Routes>
      {/* 로그인 */}
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />

      {/* ❌ 이 중복된 라인을 삭제합니다. */}
      {/* <Route path="/" element={session ? <Layout session={session} /> : <Navigate to="/login" />}></Route> */}
      
      {/* ✅ 그리고 원래 있던 이 라인에 session={session}을 추가합니다. */}
      <Route path="/" element={session ? <Layout session={session} /> : <Navigate to="/login" />}>

        {/* 홈 -> /trace 경로로 리디렉션 */}
        <Route index element={<Navigate to="/trace" replace />} />

        {/* Tracing */}
        <Route path="trace" element={<Tracing />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="sessions/:sessionId" element={<SessionDetail />} />

        {/* Prompts */}
        <Route path="prompts" element={<Prompts />} />
        <Route path="prompts/:id" element={<PromptsDetail />} />
        <Route path="prompts/new" element={<PromptsNew />} />

        {/* Playground */}
        <Route path="project/:projectId/playground" element={<Playground />} />
        <Route path="playground" element={<ProjectGate />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<General />} />
          <Route path="api-keys" element={<ApiKeys />} /> {/* 이 라인이 빠져있어서 추가했습니다. */}
          <Route path="llm-connections" element={<LLMConnections />} />
          <Route path="models" element={<Models />} />
          <Route path="scores" element={<Scores />} />
          <Route path="members" element={<Members />} />
        </Route>

      </Route>
    </Routes>
  );
}

// 이전 코드 (참고용- settings, 계정 layout 깨짐현상)
  // return (
  //   <Routes>
  //     {/* 로그인 */}
  //     <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
  //     <Route path="/" element={session ? <Layout /> : <Navigate to="/login" />}>

  //       {/* 홈 -> /trace 경로로 리디렉션 */}
  //       <Route index element={<Navigate to="/trace" replace />} />

  //       {/* Tracing */}
  //       <Route path="trace" element={<Tracing />} />
  //       <Route path="sessions" element={<Sessions />} />
  //       <Route path="sessions/:sessionId" element={<SessionDetail />} />

  //       {/* Prompts */}
  //       <Route path="prompts" element={<Prompts />} />
  //       <Route path="prompts/:id" element={<PromptsDetail />} />
  //       <Route path="prompts/new" element={<PromptsNew />} />

  //       {/* Playground */}
  //       {/* ✅ 표준 경로: URL에서 projectId를 직접 읽어 사용 */}
  //       <Route path="project/:projectId/playground" element={<Playground />} />

  //       {/* ✅ 짧은 경로: 게이트가 projectId를 찾아 표준 경로로 리다이렉트 또는 배너 표시 */}
  //       {/* 👇 기존: <Route path="playground" element={<Playground />} /> 를 교체 */}
  //       <Route path="playground" element={<ProjectGate />} />

  //       {/* <Route path="llm-as-a-judge" element={<JudgePage />} /> */}

  //       {/* <Route path="evaluation" element={<Navigate to="/scores" replace />} />
  //       <Route path="evaluation/new" element={<Navigate to="/scores/new" replace />} />
  //       <Route path="evaluation/:id" element={<Navigate to="/scores/:id" replace />} />
  //       <Route path="evaluation/:id/edit" element={<Navigate to="/scores/:id/edit" replace />} /> */}

  //       {/* <Route path="dashboards" element={<Dashboards />} />
  //       <Route path="dashboards/new" element={<DashboardNew />} />
  //       <Route path="dashboards/widgets/new" element={<WidgetNew />} />
  //       <Route path="dashboards/:dashboardId" element={<DashboardDetail />} /> */}

  //       <Route path="settings" element={<SettingsPage />}>
  //         <Route index element={<General />} />
  //         <Route path="llm-connections" element={<LLMConnections />} />
  //         <Route path="models" element={<Models />} />
  //         <Route path="scores" element={<Scores />} />
  //         <Route path="members" element={<Members />} />
  //       </Route>

  //     </Route>
  //   </Routes>
  // );

