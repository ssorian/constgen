import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFilename(request: Request): string {
  const disposition = request.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? `upload-${Date.now()}.pdf`;
}

export async function POST(request: Request) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!accountName || !accountKey || !containerName) {
    return Response.json(
      { error: "Faltan variables de entorno" },
      { status: 500 }
    );
  }

  try {
    const arrayBuffer = await request.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (fileBuffer.length === 0) {
      return Response.json(
        { error: "El archivo está vacío" },
        { status: 400 }
      );
    }

    const filename = getFilename(request);
    const contentType =
      request.headers.get("content-type") || "application/octet-stream";

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new StorageSharedKeyCredential(accountName, accountKey)
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    return Response.json({
      message: "Archivo subido con éxito",
      url: blockBlobClient.url,
    });
  } catch (error) {
    console.error("Error subiendo archivo:", error);
    return Response.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}