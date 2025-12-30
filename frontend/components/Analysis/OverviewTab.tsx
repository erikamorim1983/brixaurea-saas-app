'use client';

interface OverviewTabProps {
    project: any;
    location: any;
    lang: string;
    dict: any;
}

export default function OverviewTab({ project, location, lang, dict }: OverviewTabProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#081F2E] mb-2">
                    {dict.analysis?.tabs?.overview || 'Overview'}
                </h3>
                <p className="text-gray-500 text-sm">
                    {lang === 'pt'
                        ? 'Resumo do projeto e indicadores principais serão exibidos aqui em breve.'
                        : 'Project summary and key indicators will be displayed here soon.'}
                </p>
                {/* Future: Add KPI Cards here (VGV, ROI, Profit Margin) */}
            </div>
        </div>
    );
}
