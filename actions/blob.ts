'use server';

import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlobUploadResult {
    fileName: string;
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBlobClient(fileName: string) {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!accountName || !accountKey || !containerName) {
        throw new Error(
            'Faltan variables de entorno: AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_CONTAINER_NAME',
        );
    }

    const blobService = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new StorageSharedKeyCredential(accountName, accountKey),
    );

    const container = blobService.getContainerClient(containerName);
    const block = container.getBlockBlobClient(fileName);
    return block;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Sube un único PDF (como Buffer) a Azure Blob Storage.
 * Retorna la URL pública del blob creado.
 */
export async function uploadToBlob(
    fileBuffer: Buffer,
    fileName: string,
): Promise<{ url: string }> {
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('El archivo está vacío');
    }

    const blockBlobClient = getBlobClient(fileName);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: 'application/pdf' },
    });

    return { url: blockBlobClient.url };
}

/**
 * Sube múltiples PDFs a Azure Blob Storage de forma secuencial.
 * Retorna un array con el resultado individual de cada archivo.
 */
export async function uploadBulkToBlob(
    files: { buffer: Buffer; fileName: string }[],
): Promise<BlobUploadResult[]> {
    if (!files || files.length === 0) {
        throw new Error('No hay archivos para subir');
    }

    const results: BlobUploadResult[] = [];

    for (const file of files) {
        try {
            const { url } = await uploadToBlob(file.buffer, file.fileName);
            results.push({ fileName: file.fileName, success: true, url });
        } catch (error: any) {
            console.error(`Error subiendo ${file.fileName}:`, error);
            results.push({
                fileName: file.fileName,
                success: false,
                error: error?.message ?? 'Error desconocido',
            });
        }
    }

    return results;
}
