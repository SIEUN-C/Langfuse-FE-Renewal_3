import React, { useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./ChatBox.module.css";
import { GripVertical, X, MessageSquarePlus, PlusSquare } from "lucide-react";

/**
 * 메시지 객체 형태(권장)
 * kind === "message"  => { id, kind:"message", role:"System"|"User"|"Assistant"|"Developer", content:string }
 * kind === "placeholder" => { id, kind:"placeholder", name:string }
 *
 * ▣ 화면 매핑
 * - 왼쪽 라벨/셀렉트: System/User/Assistant/Developer 또는 placeholder 뱃지
 * - 오른쪽 입력:
 *   - message: textarea (role 별 안내 placeholder)
 *   - placeholder: input (이름만 입력, 예: msg_history)
 * - 행 오른쪽 끝의 X: 해당 행 삭제
 * - 하단 "+ Message" / "+ Placeholder" 버튼: 행 추가
 */

// Draggable 메시지/플레이스홀더 한 줄
const ChatMessageRow = ({
    row,
    index,
    moveRow,
    onChange,
    onRemove,
}) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: "chat-row",
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverRect.top;

            if (
                (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
                (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
            ) {
                return;
            }
            moveRow(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: "chat-row",
        item: () => ({ id: row.id, index }),
        collect: (m) => ({ isDragging: m.isDragging() }),
    });

    preview(drop(ref));

    const isMsg = row.kind === "message";

    return (
        <div
            ref={ref}
            className={styles.messageRow}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {/* ⋮⋮ 드래그 핸들 */}
            <div ref={drag} className={styles.dragHandleWrapper} title="Drag to reorder">
                <GripVertical className={styles.dragHandle} size={18} />
            </div>

            {/* 왼쪽 역할 셀: message면 select, placeholder면 배지 */}
            <div className={styles.roleCol}>
                {isMsg ? (
                    <select
                        className={styles.roleSelect}
                        value={row.role}
                        onChange={(e) => onChange(row.id, { role: e.target.value })}
                    >
                        {/* ✅ Developer 역할 추가 */}
                        <option>System</option>
                        <option>Developer</option>
                        <option>User</option>
                        <option>Assistant</option>
                    </select>
                ) : (
                    <span className={styles.placeholderRole}>placeholder</span>
                )}
            </div>

            {/* 우측 입력: message → textarea / placeholder → input */}
            <div className={styles.inputCol}>
                {isMsg ? (
                    <textarea
                        className={styles.messageTextarea}
                        rows={1}
                        placeholder={
                            // ✅ 역할별 안내 문구에 Developer 추가
                            row.role === "System"
                                ? "Enter a system message here."
                                : row.role === "Developer"
                                    ? "Enter a developer message here."
                                    : row.role === "Assistant"
                                        ? "Enter an assistant message here."
                                        : "Enter a user message here."
                        }
                        value={row.content}
                        onChange={(e) => onChange(row.id, { content: e.target.value })}
                    />
                ) : (
                    <input
                        className={styles.placeholderInput}
                        placeholder='Enter placeholder name (e.g., "msg_history") here.'
                        value={row.name ?? ""}
                        onChange={(e) => onChange(row.id, { name: e.target.value })}
                    />
                )}
            </div>

            {/* 삭제 버튼 */}
            <button
                className={styles.removeButton}
                onClick={() => onRemove(row.id)}
                title="Remove row"
            >
                <X size={16} />
            </button>
        </div>
    );
};

const ChatBox = ({ messages, setMessages }) => {
    // 1) 초기 렌더 시 System + User 2줄 자동 생성 (비어있을 때만)
    useEffect(() => {
        if (!messages || messages.length === 0) {
            const initRows = [
                {
                    id: crypto.randomUUID(),
                    kind: "message",
                    role: "System",
                    content: "",
                },
                {
                    id: crypto.randomUUID(),
                    kind: "message",
                    role: "User",
                    content: "",
                },
            ];
            setMessages(initRows);
        }
    }, [messages, setMessages]);

    // 2) +Message 클릭 시 다음 역할 계산
    const computeNextRole = () => {
        // 뒤에서부터 message(placeholder 제외) 찾기
        const lastMsg = [...messages].reverse().find((m) => m.kind === "message");
        // ✅ 기본 시작점: Assistant
        if (!lastMsg) return "Assistant";

        // ✅ 역할 순환에 Developer 포함
        // System → Developer → User → Assistant → User …
        if (lastMsg.role === "System") return "Developer";
        if (lastMsg.role === "Developer") return "User";
        if (lastMsg.role === "User") return "Assistant";
        if (lastMsg.role === "Assistant") return "User";
        return "User";
    };

    const addMessage = () => {
        const nextRole = computeNextRole();
        const row = {
            id: crypto.randomUUID(),
            kind: "message",
            role: nextRole,
            content: "",
        };
        setMessages((prev) => [...prev, row]);
    };

    const addPlaceholder = () => {
        const row = {
            id: crypto.randomUUID(),
            kind: "placeholder",
            name: "",
        };
        setMessages((prev) => [...prev, row]);
    };

    const removeRow = (id) => {
        setMessages((prev) => prev.filter((r) => r.id !== id));
    };

    const updateRow = (id, patch) => {
        setMessages((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const moveRow = (dragIndex, hoverIndex) => {
        setMessages((prev) => {
            const arr = [...prev];
            const [dragged] = arr.splice(dragIndex, 1);
            arr.splice(hoverIndex, 0, dragged);
            return arr;
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={styles.chatEditor}>
                {/* 힌트: 빈 상태였다가 초기화되기 전 짧은 찰나를 위한 안내 */}
                {(!messages || messages.length === 0) && (
                    <div className={styles.hint}>
                        System과 User가 자동으로 추가됩니다…
                    </div>
                )}

                {messages?.map((row, idx) => (
                    <ChatMessageRow
                        key={row.id}
                        index={idx}
                        row={row}
                        moveRow={moveRow}
                        onChange={updateRow}
                        onRemove={removeRow}
                    />
                ))}

                {/* 하단 컨트롤바: + Message / + Placeholder */}
                <div className={styles.chatActions}>
                    <button className={styles.addBtn} onClick={addMessage}>
                        <MessageSquarePlus size={16} /> Message
                    </button>
                    <button className={styles.addBtn} onClick={addPlaceholder}>
                        <PlusSquare size={16} /> Placeholder
                    </button>
                </div>
            </div>
        </DndProvider>
    );
};

export default ChatBox;