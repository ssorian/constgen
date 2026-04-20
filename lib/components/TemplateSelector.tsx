'use client';

import { useEffect, useState } from 'react';
import { TemplateMeta } from '@/lib/templates/registry';

interface TemplateSelectorProps {
    value: string;
    onChange: (id: string) => void;
}

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<TemplateMeta[]>([]);

    useEffect(() => {
        fetch('/api/templates')
            .then((r) => r.json())
            .then(setTemplates)
            .catch(() => {});
    }, []);

    if (templates.length === 0) return null;

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#d5b981] whitespace-nowrap">
                Plantilla:
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white text-gray-800 text-sm border border-[#d5b981] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d5b981]"
            >
                {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
