'use client';

import { useParams } from 'next/navigation';
import BrixAureAI from './BrixAureAI';

interface BrixAureAIWrapperProps {
    lang: string;
    dict: any;
}

export default function BrixAureAIWrapper({ lang, dict }: BrixAureAIWrapperProps) {
    const params = useParams();
    const projectId = params?.projectId as string | undefined;

    return <BrixAureAI lang={lang} dict={dict} projectId={projectId} />;
}
