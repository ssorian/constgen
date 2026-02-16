import { chromium } from 'playwright';
import { CertificateData } from './types/certificate';
import { generateCertificateHTML } from './templates/certificateTemplate';

export async function generatePdf(data: CertificateData): Promise<Buffer> {
    let browser;

    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true,
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        // Generate HTML content
        const htmlContent = generateCertificateHTML(data);

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle',
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'Letter', // 8.5" x 11"
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
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
