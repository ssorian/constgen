import fs from 'fs/promises';
import path from 'path';

/**
 * Convierte una imagen del directorio public a base64
 */
export async function imageToBase64(imagePath: string): Promise<string> {
    try {
        // Remove leading slash if present
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

        // Construct the full path to the image in the public directory
        const fullPath = path.join(process.cwd(), 'public', cleanPath);

        // Read the file
        const imageBuffer = await fs.readFile(fullPath);

        // Determine the MIME type based on file extension
        const ext = path.extname(cleanPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
        };

        const mimeType = mimeTypes[ext] || 'image/png';

        // Convert to base64
        const base64 = imageBuffer.toString('base64');

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`Error converting image to base64: ${imagePath}`, error);
        // Return a transparent 1x1 pixel PNG as fallback
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
}

/**
 * Convierte múltiples imágenes a base64
 */
export async function imagesToBase64(imagePaths: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
        imagePaths.map(async (imagePath) => {
            results[imagePath] = await imageToBase64(imagePath);
        })
    );

    return results;
}
