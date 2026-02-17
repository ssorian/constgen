'use client';

import { useEffect, useRef, useState } from 'react';
import { CertificateData } from '@/lib/types/certificate';
import { CertificateTemplate } from '@/lib/templates/CertificateTemplate';

interface CertificatePreviewProps {
    data: CertificateData;
}

export default function CertificatePreview({ data }: CertificatePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // Add margins/padding consideration (p-8 = 32px * 2 = 64px)
                const availableWidth = containerWidth - 64;
                const targetWidth = 1056; // 11in at 96dpi (11 * 96)

                // Calculate scale to fit width
                let newScale = availableWidth / targetWidth;

                // Cap max scale to prevent it from being too large on huge screens
                newScale = Math.min(newScale, 1.2);

                // Use a standard minimum scale to avoid it disappearing
                newScale = Math.max(newScale, 0.1);

                setScale(newScale);
            }
        };

        // Initial calculation
        updateScale();

        // Resize observer
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        window.addEventListener('resize', updateScale);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    const FULL_WIDTH = 1056; // 11in * 96dpi
    const FULL_HEIGHT = 816; // 8.5in * 96dpi

    // The wrapper needs to have the dimensions of the SCALED content
    // so that the parent flex container centers it correctly.
    const PREVIEW_WIDTH = FULL_WIDTH * scale;
    const PREVIEW_HEIGHT = FULL_HEIGHT * scale;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 ">Previsualización (React)</h2>

            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center min-h-[500px] overflow-hidden"
            >
                {/* 
                   Wrapper div to establish the space the scaled certificate occupies.
                   This allows flexbox centering to work on the visual size.
                */}
                <div
                    style={{
                        width: `${PREVIEW_WIDTH}px`,
                        height: `${PREVIEW_HEIGHT}px`,
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    {/* 
                       Inner div contains the actual certificate at full size, 
                       scaled down to fit the wrapper.
                    */}
                    <div
                        className="bg-white origin-top-left"
                        style={{
                            width: `${FULL_WIDTH}px`,
                            height: `${FULL_HEIGHT}px`,
                            transform: `scale(${scale})`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    >
                        <CertificateTemplate data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
