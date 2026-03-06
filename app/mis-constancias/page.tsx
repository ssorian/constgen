import { redirect } from 'next/navigation';
import { getSession } from '@/actions/auth/getSession';
import { logout } from '@/actions/auth/logout';
import { getMisConstancias } from '@/actions/certificates/getMisConstancias';
import DownloadButton from '@/lib/components/DownloadButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mis Constancias - ENSultepec',
    description: 'Historial académico y constancias de la Escuela Normal de Sultepec.',
};

export default async function MisConstanciasPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const constancias = await getMisConstancias(session.alumno_id);

    return (
        <div style={{ background: '#4a1324', minHeight: '100vh', margin: 0, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>

                {/* Header del perfil */}
                <div
                    style={{
                        background: 'white',
                        padding: '25px',
                        borderRadius: '8px',
                        marginBottom: '25px',
                        borderLeft: '8px solid #d5b981',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        color: '#1a1a1a',
                    }}
                >
                    <div>
                        <h1 style={{ color: '#691c32', margin: 0 }}>Mi Historial Académico</h1>
                        <p style={{ margin: '5px 0' }}>Alumno: <strong>{session.nombre}</strong></p>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#333' }}>Matrícula: {session.matricula}</p>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            style={{
                                color: '#691c32',
                                fontWeight: 'bold',
                                border: '2px solid #691c32',
                                padding: '8px 15px',
                                borderRadius: '4px',
                                background: 'transparent',
                                cursor: 'pointer',
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </div>

                {/* Grid de constancias */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px',
                    }}
                >
                    {constancias.length > 0 ? (
                        constancias.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    borderTop: '5px solid #d5b981',
                                    color: '#1a1a1a',
                                }}
                            >
                                <h3 style={{ color: '#691c32', marginTop: 0 }}>{c.titulo}</h3>
                                <p><strong>CUV:</strong> <code>{c.cuv}</code></p>
                                <p><strong>Carga Horaria:</strong> {c.numeros_horas} hrs</p>
                                <p><strong>Año:</strong> {c.ano_emision}</p>
                                <DownloadButton cuv={c.cuv} titulo={c.titulo} />
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                gridColumn: '1 / -1',
                                background: 'white',
                                padding: '40px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#1a1a1a',
                            }}
                        >
                            <h3>No tienes constancias registradas.</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
