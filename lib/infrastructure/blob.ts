import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

export interface BlobUploadResult {
    fileName: string;
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Infrastructure: Azure Blob Storage adapter.
 * Returns a client for a specific blob file. All uploads go through this module.
 */
function getBlockBlobClient(fileName: string) {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!accountName || !accountKey || !containerName) {
        throw new Error(
            'Missing env vars: AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_CONTAINER_NAME',
        );
    }

    const blobService = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new StorageSharedKeyCredential(accountName, accountKey),
    );

    return blobService.getContainerClient(containerName).getBlockBlobClient(fileName);
}

/** Uploads a single PDF buffer to Azure Blob Storage. Returns the public URL. */
export async function uploadPdfToBlob(fileBuffer: Buffer, fileName: string): Promise<{ url: string }> {
    if (!fileBuffer || fileBuffer.length === 0) throw new Error('El archivo está vacío');

    const client = getBlockBlobClient(fileName);
    await client.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: 'application/pdf' },
    });

    return { url: client.url };
}

/** Uploads multiple PDF buffers. Each upload is attempted independently. */
export async function uploadMultiplePdfsToBlob(
    files: { buffer: Buffer; fileName: string }[],
): Promise<BlobUploadResult[]> {
    if (!files || files.length === 0) throw new Error('No hay archivos para subir');

    const results = await Promise.allSettled(
        files.map(async (file) => {
            const { url } = await uploadPdfToBlob(file.buffer, file.fileName);
            return { fileName: file.fileName, success: true, url };
        }),
    );

    return results.map((result) => {
        if (result.status === 'fulfilled') return result.value;
        return {
            fileName: 'Unknown',
            success: false,
            error: (result.reason as Error)?.message ?? 'Error desconocido',
        };
    });
}

/** Downloads a PDF by URL (follows redirects, handles OneDrive embed links). */
export async function fetchPdfFromUrl(url: string): Promise<Buffer> {
    let downloadUrl = url;
    if (url.includes('embed')) {
        downloadUrl = url.replace('embed', 'download');
    } else {
        const sep = url.includes('?') ? '&' : '?';
        downloadUrl = url + sep + 'download=1';
    }

    const response = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
}
