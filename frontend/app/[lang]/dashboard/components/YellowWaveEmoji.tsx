'use client';

export default function YellowWaveEmoji() {
    return (
        <span
            className="inline-block"
            style={{
                filter: 'grayscale(100%) brightness(1.1) sepia(100%) hue-rotate(30deg) saturate(10) contrast(1.1)',
                WebkitTextFillColor: 'initial',
                color: 'initial',
                backgroundClip: 'border-box'
            }}
        >
            👋
        </span>
    );
}
