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
        const file = formData.get("file") as File
        const fileName = formData.get("fileName") as string

        if (!file) {
            return NextResponse.json({ error: "No hay archivo" }, { status: 400 })
        }

        const finalFileName = fileName || file.name
        const folderName = "Constancias"
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to OneDrive using Microsoft Graph API
        const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${finalFileName}:/content`

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/pdf",
            },
            body: buffer,
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("OneDrive upload error:", errorData)
            return NextResponse.json(
                { error: errorData.error?.message || "Error al subir archivo" },
                { status: response.status }
            )
        }

        const result = await response.json()

        return NextResponse.json({
            success: true,
            webUrl: result.webUrl,
            fileName: finalFileName,
            id: result.id
        })
    } catch (error) {
        console.error("Error uploading to OneDrive:", error)
        return NextResponse.json(
            { error: "Error en el servidor" },
            { status: 500 }
        )
    }
}
