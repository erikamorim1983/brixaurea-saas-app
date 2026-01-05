'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import InviteMemberModal from './InviteMemberModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface TeamMembersListProps {
    lang: string;
    user: any;
    maxUsers: number;
}

export default function TeamMembersList({ lang, user, maxUsers }: TeamMembersListProps) {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

    const supabase = createClient();

    const fetchMembers = async () => {
        setLoading(true);
        // Fetch members of the user's organization (where user is owner)
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                *,
                member_user:member_user_id (
                    email,
                    first_name,
                    last_name,
                    logo_url
                )
            `)
            .eq('organization_owner_id', user.id);

        if (!error && data) {
            setMembers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, [user.id]);

    const handleRemoveClick = (memberId: string) => {
        setMemberToDelete(memberId);
        setDeleteModalOpen(true);
    };

    const confirmRemove = async () => {
        if (!memberToDelete) return;

        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('id', memberToDelete);

        if (!error) {
            fetchMembers();
        } else {
            alert(lang === 'pt' ? 'Erro ao remover membro' : 'Error removing member');
        }
        setDeleteModalOpen(false);
        setMemberToDelete(null);
    };

    const currentCount = members.length + 1; // +1 for owner
    const limitLabel = maxUsers === -1 ? (lang === 'pt' ? 'Ilimitado' : 'Unlimited') : maxUsers;
    const canInvite = maxUsers === -1 || currentCount < maxUsers;

    return (
        <div className="space-y-6">
            {/* Stats & Action */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-medium">{lang === 'pt' ? 'Membros Ativos' : 'Active Members'}</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {currentCount} <span className="text-sm font-normal text-gray-400">/ {limitLabel}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsInviteOpen(true)}
                    disabled={!canInvite}
                    className="px-4 py-2 bg-[#081F2E] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {lang === 'pt' ? 'Convidar Novo' : 'Invite New'}
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">{lang === 'pt' ? 'Usuário' : 'User'}</th>
                                <th className="px-6 py-4 font-medium">{lang === 'pt' ? 'Função' : 'Role'}</th>
                                <th className="px-6 py-4 font-medium">{lang === 'pt' ? 'Status' : 'Status'}</th>
                                <th className="px-6 py-4 font-medium text-right">{lang === 'pt' ? 'Ações' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Owner Row (Fixed) */}
                            <tr className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs">
                                            YOU
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{lang === 'pt' ? 'Você (Dono)' : 'You (Owner)'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Owner
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-gray-300">-</span>
                                </td>
                            </tr>

                            {/* Members Rows */}
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                        {lang === 'pt' ? 'Nenhum membro convidado' : 'No members invited yet'}
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                    {(member.member_user?.first_name?.[0] || member.member_user?.email?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {member.member_user?.first_name
                                                            ? `${member.member_user.first_name} ${member.member_user.last_name || ''}`
                                                            : (member.member_user?.email || 'Unknown User')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{member.member_user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveClick(member.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                {lang === 'pt' ? 'Remover' : 'Remove'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                lang={lang}
                onSuccess={fetchMembers}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmRemove}
                title="BrixAurea"
                message={lang === 'pt' ? 'Tem certeza que deseja remover este membro?' : 'Are you sure you want to remove this member?'}
                confirmText={lang === 'pt' ? 'Remover' : 'Remove'}
                cancelText={lang === 'pt' ? 'Cancelar' : 'Cancel'}
                isDestructive={true}
            />
        </div>
    );
}
