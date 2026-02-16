'use client';

import { useEffect, useRef } from 'react';
import { CertificateData } from '@/lib/types/certificate';
import { generateCertificateHTML } from '@/lib/templates/certificateTemplate';

interface CertificatePreviewProps {
    data: CertificateData;
}

export default function CertificatePreview({ data }: CertificatePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const html = generateCertificateHTML(data);
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();
            }
        }
    }, [data]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Previsualización</h2>

            <div className="flex-1 bg-gray-100 rounded-lg p-8 flex items-start justify-center overflow-hidden">
                <div className="bg-white shadow-2xl" style={{
                    width: '400px', // Fixed smaller width for preview
                    height: '517px', // Proportional height (400 * 11 / 8.5)
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <iframe
                        ref={iframeRef}
                        title="Certificate Preview"
                        className="border-0"
                        style={{
                            width: '816px', // Letter width at 96dpi (8.5in)
                            height: '1056px', // Letter height at 96dpi (11in)
                            transform: `scale(${400 / 816})`, // Scale factor to fit 400px
                            transformOrigin: 'top left',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
