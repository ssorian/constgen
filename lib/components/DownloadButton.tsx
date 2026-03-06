'use client';

import { useTransition } from 'react';
import { downloadCertificate } from '@/actions/certificates/download';

interface Props {
    cuv: string;
    titulo: string;
}

/**
 * Client component that calls the downloadCertificate Server Action,
 * receives the Base64 PDF, and triggers a browser download.
 */
export default function DownloadButton({ cuv, titulo }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            const result = await downloadCertificate(cuv);

            if (!result.ok) {
                alert(result.error);
                return;
            }

            const byteCharacters = atob(result.base64);
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteNumbers], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isPending}
            style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                background: isPending ? '#9ca3af' : '#691c32',
                color: 'white',
                textAlign: 'center',
                borderRadius: '4px',
                fontWeight: 'bold',
                marginTop: '15px',
                boxSizing: 'border-box',
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
            }}
        >
            {isPending ? 'Descargando...' : 'Descargar Constancia PDF'}
        </button>
    );
}
