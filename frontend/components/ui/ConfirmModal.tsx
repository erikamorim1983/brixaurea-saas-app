'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'BrixAurea',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100"
                    >
                        {/* Header with BrixAurea Logo/Icon feel */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white font-bold text-sm">BA</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all transform active:scale-95 ${isDestructive
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                    : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
