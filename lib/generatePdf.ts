import { chromium } from 'playwright';
import { CertificateData } from './types/certificate';
import { generateCertificateHtml } from './templates/CertificateTemplate';
import { imagesToBase64 } from './utils/imageToBase64';

export async function generatePdf(data: CertificateData): Promise<Buffer> {
    let browser;

    try {
        // Convert images to base64 for embedding in the PDF
        const imageNames = [
            'Colibrii.png',
            'Header.png',
            'Sello.png',
            'Firma.png',
            'Logos.png',
            'Flores.png'
        ];

        const base64Images = await imagesToBase64(imageNames);

        // Map to the structure expected by generateCertificateHtml
        const images = {
            colibri: base64Images['Colibrii.png'],
            header: base64Images['Header.png'],
            sello: base64Images['Sello.png'],
            firma: base64Images['Firma.png'],
            logos: base64Images['Logos.png'],
            flores: base64Images['Flores.png']
        };

        // Launch browser
        browser = await chromium.launch({
            headless: true,
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        // Generate HTML content with embedded base64 images
        const htmlContent = generateCertificateHtml(data, images);

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle',
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: true,
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0',
            },
        });

        await browser.close();

        return Buffer.from(pdfBuffer);
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        throw error;
    }
}

