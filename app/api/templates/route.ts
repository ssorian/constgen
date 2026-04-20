import { NextResponse } from 'next/server';
import { getTemplateMetas } from '@/lib/templates/registry';

export async function GET() {
    return NextResponse.json(getTemplateMetas());
}
