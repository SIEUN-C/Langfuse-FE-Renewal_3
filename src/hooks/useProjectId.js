// src/hooks/useProjectId.js
import { useEffect, useMemo, useState } from "react";

const LS_KEY = "activeProjectId";

// projectId로 "그럴싸한" 값만 허용 (너무 엄격 X)
function isLikelyProjectId(s) {
    if (typeof s !== "string") return false;
    const trimmed = s.trim();
    if (!trimmed) return false;
    if (trimmed.length < 8 || trimmed.length > 64) return false; // 느슨한 길이 제한
    if (/[<>\s%]/.test(trimmed)) return false; // 각괄호/공백/% 는 절대 아님
    if (/^(undefined|null|projectId)$/i.test(trimmed)) return false;
    // 보통 영숫자/하이픈/언더스코어 조합
    if (!/^[a-z0-9_-]+$/i.test(trimmed)) return false;
    return true;
}

export default function useProjectId(opts = {}) {
    const {
        location,
        sourcePriority = ["path", "query", "localStorage", "session"],
    } = opts;

    const [projectId, setProjectIdState] = useState(null); // null=로딩, ""=없음, "abc"=OK
    const [source, setSource] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") {
            setProjectIdState("");
            return;
        }

        const pathname = location?.pathname ?? window.location.pathname;
        const search = location?.search ?? window.location.search;

        // 저장 + 출처 기록 + localStorage 반영
        const setAndPersist = (pid, src) => {
            setProjectIdState(pid);
            setSource(src);
            try { localStorage.setItem(LS_KEY, pid); } catch { }
        };

        // 1) /project/:id
        if (sourcePriority.includes("path")) {
            const m = pathname.match(/\/project\/([^/]+)/);
            if (m?.[1] && isLikelyProjectId(m[1])) {
                setAndPersist(m[1], "path");
                return;
            }
        }

        // 2) ?projectId=...
        if (sourcePriority.includes("query")) {
            const qsId = new URLSearchParams(search).get("projectId");
            if (qsId && isLikelyProjectId(qsId)) {
                setAndPersist(qsId, "query");
                return;
            }
        }

        // 3) localStorage
        if (sourcePriority.includes("localStorage")) {
            const lsId = localStorage.getItem(LS_KEY);
            if (lsId && isLikelyProjectId(lsId)) {
                setProjectIdState(lsId);
                setSource("localStorage");
                return;
            } else if (lsId) {
                // 이상한 값이면 치워버리자
                try { localStorage.removeItem(LS_KEY); } catch { }
            }
        }

        // 4) 세션 추정 (환경에 따라 스키마 다르므로 느슨하게)
        if (sourcePriority.includes("session")) {
            (async () => {
                try {
                    const r = await fetch("/api/auth/session", { credentials: "include" });
                    if (!r.ok) {
                        setProjectIdState("");
                        setSource("session:401");
                        return;
                    }
                    const s = await r.json();
                    const pid =
                        s?.project?.id ||
                        s?.activeProjectId ||
                        s?.defaultProjectId ||
                        (Array.isArray(s?.memberships) ? s.memberships[0]?.projectId : undefined);

                    if (isLikelyProjectId(pid)) {
                        setAndPersist(pid, "session");
                    } else {
                        setProjectIdState("");
                        setSource("session:empty");
                    }
                } catch {
                    setProjectIdState("");
                    setSource("session:error");
                }
            })();
        } else {
            setProjectIdState("");
            setSource("session:skipped");
        }
    }, [location?.pathname, location?.search, sourcePriority.join("|")]);

    // 수동 지정 + 저장
    const setProjectId = (pid) => {
        const ok = isLikelyProjectId(pid);
        if (ok) {
            try { localStorage.setItem(LS_KEY, pid); } catch { }
            setProjectIdState(pid);
            setSource("manual");
        } else {
            // 잘못된 입력은 무시 (배너에서 실수로 <> 넣는 상황 방지)
            setProjectIdState("");
            setSource("manual:invalid");
        }
    };

    return useMemo(
        () => ({ projectId, source, setProjectId }),
        [projectId, source]
    );
}
