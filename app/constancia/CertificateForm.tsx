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
                    <label htmlFor="matricula" className="block text-sm font-medium text-black mb-2">
                        Matrícula del Alumno *
                    </label>
                    <input
                        type="text"
                        id="matricula"
                        value={data.matricula || ''}
                        onChange={(e) => handleChange('matricula', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                        placeholder="Ej: 2023A001"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="curp" className="block text-sm font-medium text-black mb-2">
                        CURP del Alumno *
                    </label>
                    <input
                        type="text"
                        id="curp"
                        value={data.curp || ''}
                        onChange={(e) => handleChange('curp', e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-black"
                        placeholder="Ej: GARC850101HDFRNN09"
                        required
                    />
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
                * Todos los campos son obligatorios
            </p>
        </div>
    );
}
