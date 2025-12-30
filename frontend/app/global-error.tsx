'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-[#081F2E]">
                    <h2 className="text-3xl font-bold mb-4">Algo deu errado!</h2>
                    <p className="text-gray-600 mb-8 max-w-md text-center">
                        Encontramos um erro inesperado. Nossa equipe já foi notificada.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-[#00D9FF] text-white font-bold rounded-lg hover:shadow-lg transition-all"
                        >
                            Tentar Novamente
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all"
                        >
                            Voltar para Home
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg max-w-2xl overflow-auto text-xs font-mono">
                            <p className="font-bold mb-2">Error Details:</p>
                            {error.message}
                            {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
