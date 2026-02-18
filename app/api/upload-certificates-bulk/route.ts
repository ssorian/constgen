import { proxy } from "@/proxy"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const session = await proxy()

    if (!session || !session.accessToken) {
        return NextResponse.json(
            { error: "No autorizado. Inicia sesión primero." },
            { status: 401 }
        )
    }

    try {
        const formData = await req.formData()
        const files = formData.getAll("files") as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No hay archivos" }, { status: 400 })
        }

        const folderName = "Constancias"
        const results = []

        // Upload each file sequentially to avoid overwhelming the API
        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${file.name}:/content`

                const response = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        "Content-Type": "application/pdf",
                    },
                    body: buffer,
                })

                if (response.ok) {
                    const result = await response.json()
                    results.push({
                        fileName: file.name,
                        success: true,
                        webUrl: result.webUrl,
                        id: result.id
                    })
                } else {
                    const errorData = await response.json()
                    results.push({
                        fileName: file.name,
                        success: false,
                        error: errorData.error?.message || "Error desconocido"
                    })
                }
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error)
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Error al procesar archivo"
                })
            }
        }

        const successCount = results.filter(r => r.success).length
        const failedCount = results.filter(r => !r.success).length

        return NextResponse.json({
            success: true,
            total: files.length,
            uploaded: successCount,
            failed: failedCount,
            results
        })
    } catch (error) {
        console.error("Error in bulk upload:", error)
        return NextResponse.json(
            { error: "Error en el servidor" },
            { status: 500 }
        )
    }
}
