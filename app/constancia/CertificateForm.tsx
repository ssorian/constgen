'use client';

import { CertificateData } from '@/lib/types/certificate';

interface CertificateFormProps {
    data: CertificateData;
    onChange: (data: CertificateData) => void;
}

export default function CertificateForm({ data, onChange }: CertificateFormProps) {
    const handleChange = (field: keyof CertificateData, value: string | number) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Datos de la Constancia</h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-black mb-2">
                        Nombre Completo *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        value={data.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        placeholder="Ej: Juan Pérez García"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="curso" className="block text-sm font-medium text-black mb-2">
                        Nombre del Curso *
                    </label>
                    <input
                        type="text"
                        id="curso"
                        value={data.curso}
                        onChange={(e) => handleChange('curso', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        placeholder="Ej: Desarrollo Web con Next.js"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="horas" className="block text-sm font-medium text-black mb-2">
                        Horas del Curso *
                    </label>
                    <input
                        type="number"
                        id="horas"
                        value={data.horas}
                        onChange={(e) => handleChange('horas', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        placeholder="Ej: 40"
                        min="1"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-black mb-2">
                        Fecha de Conclusión *
                    </label>
                    <input
                        type="date"
                        id="fecha"
                        value={data.fecha}
                        onChange={(e) => handleChange('fecha', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="cuv" className="block text-sm font-medium text-black mb-2">
                        CUV (Código Único de Verificación) *
                    </label>
                    <input
                        type="text"
                        id="cuv"
                        value={data.cuv}
                        onChange={(e) => handleChange('cuv', e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-black"
                        placeholder="Ej: ABC123XYZ789"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="validationUrl" className="block text-sm font-medium text-black mb-2">
                        URL de Validación (para QR)
                    </label>
                    <input
                        type="url"
                        id="validationUrl"
                        value={data.validationUrl || ''}
                        onChange={(e) => handleChange('validationUrl', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        placeholder="https://ejemplo.com/validar/CUV"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Si se proporciona, se generará un código QR en la constancia.
                    </p>
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
                * Todos los campos son obligatorios
            </p>
        </div>
    );
}
