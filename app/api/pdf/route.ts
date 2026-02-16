import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '@/lib/generatePdf';
import { CertificateData } from '@/lib/types/certificate';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data } = body as { data: CertificateData };

        // Validate input
        if (!data || !data.nombre || !data.curso || !data.horas || !data.fecha || !data.cuv) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Generate QR Code if validationUrl is provided
        if (data.validationUrl) {
            try {
                data.qrCodeDataUrl = await QRCode.toDataURL(data.validationUrl, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#2c5282',
                        light: '#ffffff',
                    },
                });
            } catch (qrError) {
                console.error('Error generating QR code:', qrError);
                // Continue without QR code if generation fails
            }
        }

        // Generate PDF
        const pdfBuffer = await generatePdf(data);

        // Return PDF with proper headers
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="constancia-${data.nombre.replace(/\s+/g, '-')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { success: false, error: 'Error al generar el PDF' },
            { status: 500 }
        );
    }
}
