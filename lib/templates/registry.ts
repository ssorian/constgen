import type { ComponentType } from 'react';
import type { CertificateData } from '../types/certificate';
import {
    CertificateTemplate,
    generateCertificateHtml,
    templateMeta as defaultMeta,
} from './CertificateTemplate';
import {
    CertificateTemplate as AsistenteTemplate,
    generateCertificateHtml as generateAsistenteHtml,
    templateMeta as asistenteMeta,
} from './CertificateTemplateAsistente';
import {
    CertificateTemplate as PonenteTemplate,
    generateCertificateHtml as generatePonenteHtml,
    templateMeta as ponenteMeta,
} from './CertificateTemplatePonente';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateMeta = { id: string; name: string };

export type TemplateEntry = {
    meta: TemplateMeta;
    Component: ComponentType<{ data: CertificateData }>;
    generateHtml: (data: CertificateData, images?: Record<string, string>) => string;
};

// ─── Registry ─────────────────────────────────────────────────────────────────
// To add a new template: create a file in lib/templates/, export templateMeta,
// a default React component, and a generateHtml function, then add an entry here.

export const templateRegistry: Record<string, TemplateEntry> = {
    [defaultMeta.id]: {
        meta: defaultMeta,
        Component: CertificateTemplate,
        generateHtml: generateCertificateHtml,
    },
    [asistenteMeta.id]: {
        meta: asistenteMeta,
        Component: AsistenteTemplate,
        generateHtml: generateAsistenteHtml,
    },
    [ponenteMeta.id]: {
        meta: ponenteMeta,
        Component: PonenteTemplate,
        generateHtml: generatePonenteHtml,
    },
};

export const DEFAULT_TEMPLATE_ID = defaultMeta.id;

export function getTemplate(id?: string): TemplateEntry {
    return templateRegistry[id ?? DEFAULT_TEMPLATE_ID] ?? templateRegistry[DEFAULT_TEMPLATE_ID];
}

export function getTemplateMetas(): TemplateMeta[] {
    return Object.values(templateRegistry).map((e) => e.meta);
}
