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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-black mb-2">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={data.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value.toUpperCase())}
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
                            onChange={(e) => handleChange('curso', e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            placeholder="Ej: Desarrollo Web con Next.js"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-black mb-2">
                            Fecha Inicio Curso *
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={data.startDate || ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-black mb-2">
                            Fecha Fin Curso *
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={data.endDate || ''}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="emision" className="block text-sm font-medium text-black mb-2">
                            Fecha de Emisión *
                        </label>
                        <input
                            type="date"
                            id="emision"
                            value={data.emision || ''}
                            onChange={(e) => handleChange('emision', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="vencimiento" className="block text-sm font-medium text-black mb-2">
                            Fecha de Vencimiento *
                        </label>
                        <input
                            type="date"
                            id="vencimiento"
                            value={data.vencimiento || ''}
                            onChange={(e) => handleChange('vencimiento', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            maxLength={18}
                            minLength={18}
                            required
                        />
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
                * Todos los campos son obligatorios
            </p>
        </div>
    );
}
