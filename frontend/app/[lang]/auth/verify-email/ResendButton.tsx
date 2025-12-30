'use client';

import { useState } from 'react';

interface ResendButtonProps {
    email?: string;
    resendText: string;
    sendingText?: string;
    successText?: string;
    errorText?: string;
}

export default function ResendButton({
    email,
    resendText,
    sendingText = 'Sending...',
    successText = 'Email sent!',
    errorText = 'Error sending email'
}: ResendButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [countdown, setCountdown] = useState(0);

    const handleResend = async () => {
        if (!email || status === 'loading' || countdown > 0) return;

        setStatus('loading');

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('success');
                // Start countdown to prevent spam
                setCountdown(60);
                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setStatus('idle');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Resend error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const getButtonText = () => {
        switch (status) {
            case 'loading':
                return sendingText;
            case 'success':
                return countdown > 0 ? `${successText} (${countdown}s)` : successText;
            case 'error':
                return errorText;
            default:
                return resendText;
        }
    };

    const getButtonStyles = () => {
        switch (status) {
            case 'loading':
                return 'text-gray-400 cursor-wait';
            case 'success':
                return 'text-green-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-[#00D9FF] hover:underline cursor-pointer';
        }
    };

    return (
        <button
            onClick={handleResend}
            disabled={status === 'loading' || countdown > 0 || !email}
            className={`font-semibold transition-colors ${getButtonStyles()} disabled:cursor-not-allowed`}
        >
            {getButtonText()}
        </button>
    );
}
