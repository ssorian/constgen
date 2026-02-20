import { chromium, Browser } from 'playwright';
import { CertificateData } from './types/certificate';
import { generateCertificateHtml } from './templates/CertificateTemplate';
import { imagesToBase64 } from './utils/imageToBase64';

const IMAGE_NAMES = [
    'Colibrii.png',
    'Header.png',
    'Sello.png',
    'Firma.png',
    'Logos.png',
    'Flores.png'
];

// Global caches for serverless/long-running environments
let cachedImages: Record<string, string> | null = null;
let cachedBrowser: Browser | null = null;

async function getSharedImages() {
    if (cachedImages) return cachedImages;

    const base64Images = await imagesToBase64(IMAGE_NAMES);
    cachedImages = {
        colibri: base64Images['Colibrii.png'],
        header: base64Images['Header.png'],
        sello: base64Images['Sello.png'],
        firma: base64Images['Firma.png'],
        logos: base64Images['Logos.png'],
        flores: base64Images['Flores.png']
    };
    return cachedImages;
}

async function getBrowserInstance() {
    if (!cachedBrowser || !cachedBrowser.isConnected()) {
        cachedBrowser = await chromium.launch({ headless: true });
    }
    return cachedBrowser;
}

export async function generatePdf(data: CertificateData): Promise<Buffer> {
    const images = await getSharedImages();
    const browser = await getBrowserInstance();

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const htmlContent = generateCertificateHtml(data, images);
        await page.setContent(htmlContent, { waitUntil: 'load' });

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: true,
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
        await context.close();
        // Native browser instance is kept alive for the next request
    }
}

/**
 * Bulk generates PDFs by reusing the global cached Chromium instance 
 * and reading the base64 images exactly once for the entire batch.
 */
export async function generateBulkPdfs(dataArray: CertificateData[]): Promise<Buffer[]> {
    if (!dataArray || dataArray.length === 0) return [];

    const images = await getSharedImages();
    const browser = await getBrowserInstance();

    const context = await browser.newContext();
    const pdfBuffers: Buffer[] = [];

    try {
        // Generate each PDF sequentially to avoid huge memory spikes,
        // but skipping the Chromium boot and IO load overhead.
        for (const data of dataArray) {
            const page = await context.newPage();
            try {
                const htmlContent = generateCertificateHtml(data, images);
                await page.setContent(htmlContent, { waitUntil: 'load' });

                const pdfBuffer = await page.pdf({
                    format: 'Letter',
                    landscape: true,
                    printBackground: true,
                    margin: { top: '0', right: '0', bottom: '0', left: '0' },
                });

                pdfBuffers.push(Buffer.from(pdfBuffer));
            } finally {
                await page.close();
            }
        }
        return pdfBuffers;
    } finally {
        await context.close();
    }
}
