import { useState, useMemo, useRef, useEffect } from "react";
import { Outlet, NavLink, matchPath, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    LayoutDashboard,
    Activity,
    MessageCircleCode,
    FlaskConical,
    SquareStack,
    Lightbulb,
    Database,
    Settings,
    Search,
    ChevronDown,
} from "lucide-react";

import styles from "./Layout.module.css";
import PageHeader from "../components/PageHeader/PageHeader";

export default function Layout({ session }) {

    //session prop이 제대로 들어오는지 확인(계정값 깨짐 현상 확인용-> 문제없음 App.jsx 수정)
    //console.log("Layout 컴포넌트가 받은 session prop:", session); // <--- 이 줄을 추가하세요
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [headerConfig, setHeaderConfig] = useState({});

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuRef]);

    const user = session?.user || session || {};

    useEffect(() => {
        const fetchCsrfToken = async () => {
            console.log("CSRF 토큰을 가져오는 중...");
            try {
                const res = await fetch('/api/auth/csrf');
                if (!res.ok) {
                    console.error("CSRF 토큰 가져오기 실패:", res.status, res.statusText);
                    throw new Error("CSRF 토큰을 가져올 수 없습니다.");
                }
                const data = await res.json();
                setCsrfToken(data.csrfToken);
                console.log("CSRF 토큰 가져오기 성공:", data.csrfToken);
            } catch (e) {
                console.error("CSRF 토큰을 가져오는 중 오류 발생:", e);
            }
        };
        fetchCsrfToken();
    }, []);

    const handleSignOut = async () => {
        if (!csrfToken) {
            console.error("CSRF 토큰이 없어 로그아웃 요청을 보낼 수 없습니다.");
            alert("로그아웃을 처리할 수 없습니다. 페이지를 새로고침 후 다시 시도해 주세요.");
            window.location.href = '/login';
            return;
        }

        console.log("로그아웃 요청을 서버로 전송합니다...");
        try {
            const res = await fetch('/api/auth/signout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ csrfToken, json: 'true' }),
            });

            if (res.ok) {
                console.log("로그아웃 요청 성공! 서버가 쿠키를 삭제했습니다.");
            } else {
                const errorData = await res.json().catch(() => ({ message: '알 수 없는 오류' }));
                console.error("로그아웃 요청 실패:", res.status, res.statusText, errorData);
                alert(`로그아웃 실패: ${errorData.message}`);
            }
        } catch (error) {
            console.error("로그아웃 API 호출 중 오류 발생:", error);
            alert(`로그아웃 중 네트워크 오류가 발생했습니다. ${error.message}`);
        } finally {
            console.log("로그인 페이지로 리디렉션합니다.");
            window.location.href = '/login';
        }
    };

    const mainMenuSections = [
        {
            title: null,
            items: [
                { label: "Home", icon: <Home size={18} />, path: "/" },
            ],
        },
        {
            title: "Tracing",
            items: [
                { label: "Trace", icon: <Activity size={18} />, path: "/trace" },
                { label: "Span", icon: <Activity size={18} />, path: "/span" },
                { label: "Sessions", icon: <MessageCircleCode size={18} />, path: "/sessions" },
            ],
        },
        {
            title: "Evaluation",
            items: [
                { label: "LLM-as-a-Judge", icon: <Lightbulb size={18} />, path: "/llm-as-a-judge" },
                { label: "Datasets", icon: <Database size={18} />, path: "/datasets" },
            ],
        },
        {
            title: "Dashboards",
            items: [
                { label: "Dashboards", icon: <LayoutDashboard size={18} />, path: "/dashboards" },
            ],
        },
        {
            title: "Prompt Management",
            items: [
                { label: "Prompts", icon: <FlaskConical size={18} />, path: "/prompts" },
                { label: "Playground", icon: <SquareStack size={18} />, path: "/playground" },
            ],
        },
    ];

    const bottomMenu = [
        { label: "Settings", icon: <Settings size={18} />, path: "/settings" },
    ];

    // const navClass = ({ isActive }) =>
    //     `${styles.menuItem} ${isActive ? styles.active : ""} ${collapsed ? styles.iconOnly : ""}`.trim();

    // const sectionActive = (section) =>
    //     section.items.some(({ path }) =>
    //         !!matchPath({ path, end: path === "/" }, location.pathname) ||
    //         (path !== "/" && location.pathname.startsWith(path))
    //     );

    // <<< START: 수정된 부분 >>>
    // Playground 경로를 위한 특별 로직을 추가합니다.
    const isPathActive = (path) => {
        if (path === "/playground") {
        return location.pathname.includes("/playground");
        }
        // 기존 로직은 `NavLink`의 `isActive`에 의존하거나 `startsWith`를 사용합니다.
        return !!matchPath({ path, end: path === "/" }, location.pathname) ||
            (path !== "/" && location.pathname.startsWith(path));
    };

    const navClass = (path) => ({ isActive }) => {
        const finalIsActive = isActive || isPathActive(path);
        return `${styles.menuItem} ${finalIsActive ? styles.active : ""} ${collapsed ? styles.iconOnly : ""}`.trim();
    };

    const sectionActive = (section) =>
        section.items.some(({ path }) => isPathActive(path));
    // <<< END: 수정된 부분 >>>



    // const pageTitle = useMemo(() => {
    //   const p = location.pathname;   <<------ 아래와 같이 대체수정함(20250828_playground팀)

    // /project/:id/... 인 경우 공통 prefix 제거해서 라우트 매칭 통일
    const stripProjectPrefix = (p) => {
        const m = p.match(/^\/project\/[^/]+(\/.*)?$/);
        return m ? (m[1] || "/") : p;
    };

    const pageTitle = useMemo(() => {
        const p = location.pathname;
        if (p === "/") return "Home";
        if (p.startsWith("/llm-as-a-judge")) return "LLM-as-a-Judge Evaluators";
        if (p.startsWith("/datasets")) return "Datasets";
        if (p.startsWith("/scores")) return "Evaluators";
        if (p.startsWith("/dashboards/llm")) return "LLM Dashboard";
        if (p.startsWith("/prompts")) return "Prompts";
        if (p.startsWith("/playground")) return "Playground";
        if (p.startsWith("/trace")) return "Trace";
        if (p.startsWith("/span")) return "Span";
        if (p.startsWith("/sessions")) return "Sessions";
        if (p.startsWith("/settings")) return "Settings";
        return "Langfuse";
    }, [location.pathname]);

    const headerRightActionsDefault = useMemo(() => {
        const p = location.pathname;
        if (p.startsWith("/datasets")) {
            return (
                <button
                    type="button"
                    className={`${styles.headerActionPrimary ?? ""}`.trim()}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/datasets?new=1")}
                >
                    + New dataset
                </button>
            );
        }
        return null;
    }, [location.pathname, navigate]);


    return (
        <div className={styles.layout}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
                <div className={styles.header}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoText}>
                            {!collapsed && <span>Langfuse</span>}
                        </div>
                    </div>
                    {!collapsed && <div className={styles.divider} />}
                    {!collapsed && (
                        <div className={styles.searchBox} role="search">
                            <div className={styles.searchText}>
                                <Search size={12} aria-hidden />
                                <span>Go to...</span>
                            </div>
                            <span className={styles.hotkey}>Ctrl K</span>
                        </div>
                    )}
                </div>

                <div className={styles.menuWrapper}>
                    <ul className={styles.menu} role="menu" aria-label="Main navigation">
                        {mainMenuSections.map((section, i) => (
                            <li key={i}>
                                {section.title && !collapsed && (
                                    <div className={`${styles.sectionTitle} ${sectionActive(section) ? styles.sectionTitleActive : ""
                                        }`}>{section.title}</div>
                                )}
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.label}
                                        to={item.path}
                                        // className={navClass}
                                        // <<< START: 수정된 부분 >>>
                                        className={navClass(item.path)}
                                        // <<< END: 수정된 부분 >>>                                        end={item.path === "/"}
                                        title={collapsed ? item.label : undefined}
                                        aria-label={collapsed ? item.label : undefined}
                                        role="menuitem"
                                    >
                                        {item.icon}
                                        {!collapsed && <span>{item.label}</span>}
                                    </NavLink>
                                ))}
                                {i < mainMenuSections.length - 1 && (
                                    <div className={styles.sectionDivider}></div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <ul className={`${styles.menu} ${styles.bottomMenu}`} role="menu" aria-label="Secondary navigation">
                        {bottomMenu.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={navClass(item.path)} /* <--- 이렇게 수정해 주세요. */
                                title={collapsed ? item.label : undefined}
                                aria-label={collapsed ? item.label : undefined}
                                role="menuitem"
                            >
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </ul>

                    <div ref={userMenuRef} className={styles.userMenuContainer}>
                        {isUserMenuOpen && !collapsed && (
                            <div className={styles.userMenuPopover}>
                                <div className={styles.popoverUserInfo}>
                                    <div className={styles.popoverAvatar}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.popoverUserText}>
                                        <div className={styles.popoverUserName}>{user?.name}</div>
                                        <div className={styles.popoverUserEmail}>{user?.email}</div>
                                    </div>
                                </div>
                                <div className={styles.popoverSection}>
                                    <button className={styles.signOutButton} onClick={handleSignOut}>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.userInfo} onClick={() => setIsUserMenuOpen(prev => !prev)}>
                            <div className={styles.userAvatar}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed && (
                                <>
                                    <div className={styles.userText}>
                                        <div className={styles.popoverUserName}>{user?.name}</div>
                                        <div className={styles.popoverUserEmail}>{user?.email}</div>
                                    </div>
                                    <div className={styles.userMenuToggle}>
                                        <ChevronDown size={14} style={{
                                            transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            <main className={styles.mainContainer}>
                <PageHeader
                    orgName="Organization"
                    projectName="Project"
                    envBadge="Hobby"
                    title={headerConfig.title ?? pageTitle}
                    onToggleSidebar={() => setCollapsed((prev) => !prev)}
                    flushLeft
                    rightActions={headerConfig.rightActions ?? headerRightActionsDefault}
                />
                <div className={styles.pageBody}>
                    <Outlet context={{ setHeader: setHeaderConfig }} />
                </div>
            </main>
        </div>
    );
}