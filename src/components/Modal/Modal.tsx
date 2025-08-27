import React from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const Modal  = ({
    children,
    isOpen,
    onClose,
    title,
}: ModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className = { styles.backdrop } onClick = { onClose }>
            <div className = { styles.content } onClick = { (e) => e.stopPropagation() }>
                <div className = { styles.header }>
                    <h3 className = { styles.title}>{ title }</h3>
                    <button onClick = { onClose } className = { styles.closeButton }><X size = { 16 } /></button>
                </div>
                <div className = { styles.body }>
                    { children }
                </div>
            </div>
        </div>
    );
};

export default Modal;