'use client';

import ProjectTypeSelector from './ProjectTypeSelector';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface ProjectConfigTabProps {
    project: any;
    lang: string;
    dict: any;
}

export default function ProjectConfigTab({ project, lang, dict }: ProjectConfigTabProps) {
    const supabase = createClient();
    const [saving, setSaving] = useState(false);

    const handleSaveProjectType = async (categoryId: string, subtypeId: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    category_id: categoryId,
                    subtype_id: subtypeId
                })
                .eq('id', project.id);

            if (error) throw error;

            // Show success message
            console.log('Project type saved successfully!');
            // TODO: Add toast notification here
        } catch (err: any) {
            console.error('Error saving project type:', err);
            alert(lang === 'pt' ? 'Erro ao salvar tipo de projeto' : 'Error saving project type');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Project Type Selector */}
            <ProjectTypeSelector
                projectId={project.id}
                initialCategoryId={project.category_id}
                initialSubtypeId={project.subtype_id}
                lang={lang}
                onSave={handleSaveProjectType}
            />

            {/* Future: Add more project configuration options here */}
            {/* - Development Strategy */}
            {/* - Target Market */}
            {/* - Project Timeline */}
            {/* - Team & Stakeholders */}
        </div>
    );
}
