'use client';

import React, { useState, useCallback } from 'react';
import { LandOwner } from '@/lib/types/feasibility';
import UnitInput from '@/components/ui/UnitInput';

interface OwnersFormProps {
    initialOwners: LandOwner[];
    onOwnersChange: (owners: LandOwner[]) => void;
    dict: any;
}

export default function OwnersForm({
    initialOwners,
    onOwnersChange,
    dict
}: OwnersFormProps) {
    const [owners, setOwners] = useState<LandOwner[]>(initialOwners);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form inputs para novo/edit
    const [formData, setFormData] = useState({
        name: '',
        ownership_share_percent: undefined as number | undefined,
        is_primary: false,
        payment_form: 'cash' as 'cash' | 'financing' | 'mixed',
    });

    // Labels
    const paymentForms = [
        { value: 'cash', label: dict.payment_cash || 'Cash' },
        { value: 'financing', label: dict.payment_financing || 'Financing' },
        { value: 'mixed', label: dict.payment_mixed || 'Mixed' },
    ];

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            ownership_share_percent: undefined,
            is_primary: false,
            payment_form: 'cash',
        });
        setEditingId(null);
    }, []);

    // Add owner
    const handleAdd = useCallback(() => {
        if (!formData.name.trim()) {
            alert(dict.owner_name_required || 'Owner name is required');
            return;
        }

        const newOwner: LandOwner = {
            id: `owner-${Date.now()}`,
            type: 'individual',
            name: formData.name,
            is_primary: formData.is_primary,
            ownership_share_percent: formData.ownership_share_percent,
            payment_form: formData.payment_form,
        };

        const updated = [...owners, newOwner];
        setOwners(updated);
        onOwnersChange(updated);
        resetForm();
    }, [formData, owners, onOwnersChange, resetForm, dict]);

    // Edit owner
    const handleEdit = useCallback((owner: LandOwner) => {
        setEditingId(owner.id);
        setFormData({
            name: owner.name,
            ownership_share_percent: owner.ownership_share_percent,
            is_primary: owner.is_primary || false,
            payment_form: owner.payment_form || 'cash',
        });
    }, []);

    // Save edit
    const handleSaveEdit = useCallback(() => {
        if (!formData.name.trim()) {
            alert(dict.owner_name_required || 'Owner name is required');
            return;
        }

        const updated = owners.map(o =>
            o.id === editingId
                ? {
                    ...o,
                    name: formData.name,
                    ownership_share_percent: formData.ownership_share_percent,
                    is_primary: formData.is_primary,
                    payment_form: formData.payment_form,
                }
                : formData.is_primary && o.is_primary
                    ? { ...o, is_primary: false }
                    : o
        );

        setOwners(updated);
        onOwnersChange(updated);
        resetForm();
    }, [formData, owners, editingId, onOwnersChange, resetForm, dict]);

    // Delete owner
    const handleDelete = useCallback((id: string) => {
        const updated = owners.filter(o => o.id !== id);
        setOwners(updated);
        onOwnersChange(updated);
    }, [owners, onOwnersChange]);

    // Toggle is_primary
    const handleTogglePrimary = useCallback((id: string) => {
        const updated = owners.map(o =>
            o.id === id
                ? { ...o, is_primary: !o.is_primary }
                : { ...o, is_primary: false }
        );
        setOwners(updated);
        onOwnersChange(updated);
    }, [owners, onOwnersChange]);


    return (
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    {dict.owners_title || 'Sellers (Owners)'}
                </h2>
            </div>

            {/* Add/Edit Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                    {editingId ? dict.edit_owner || 'Edit Owner' : dict.add_owner || 'Add Owner'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                            {dict.owner_name || 'Owner Name'}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={dict.enter_name || 'Enter name'}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>

                    {/* Ownership % */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                            {dict.ownership_label || 'Ownership %'}
                        </label>
                        <UnitInput
                            value={formData.ownership_share_percent}
                            onChange={(val) => setFormData({ ...formData, ownership_share_percent: val })}
                            unit="%"
                            min={0}
                            max={100}
                            step={1}
                            precision={0}
                            placeholder="0"
                            className="w-full"
                        />
                    </div>

                    {/* Payment Form */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                            {dict.payment_form || 'Payment Form'}
                        </label>
                        <select
                            value={formData.payment_form}
                            onChange={(e) => setFormData({ ...formData, payment_form: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        >
                            {paymentForms.map(pf => (
                                <option key={pf.value} value={pf.value}>{pf.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Is Primary Checkbox */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                            {dict.primary_owner || 'Primary Owner'}
                        </label>
                        <div className="flex items-center h-10">
                            <input
                                type="checkbox"
                                checked={formData.is_primary}
                                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            {dict.cancel || 'Cancel'}
                        </button>
                    )}
                    <button
                        onClick={editingId ? handleSaveEdit : handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                        {editingId ? dict.save || 'Save' : dict.add || 'Add'}
                    </button>
                </div>
            </div>

            {/* Owners List */}
            <div>
                {owners.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {dict.no_owners || 'No owners added yet'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                                        {dict.owner_name || 'Owner Name'}
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                                        {dict.ownership_label || 'Ownership %'}
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                                        {dict.payment_form || 'Payment Form'}
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                                        {dict.primary_owner || 'Primary'}
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                                        {dict.actions || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {owners.map((owner) => (
                                    <tr key={owner.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-900">{owner.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                                            {owner.ownership_share_percent}%
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {paymentForms.find(pf => pf.value === owner.payment_form)?.label}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={owner.is_primary || false}
                                                onChange={() => handleTogglePrimary(owner.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEdit(owner)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title={dict.edit || 'Edit'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(owner.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title={dict.delete || 'Delete'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info */}
            {owners.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {dict.total_ownership_percent || 'Total Ownership'}:
                    <strong className="ml-2">
                        {owners.reduce((sum, o) => sum + (o.ownership_share_percent || 0), 0)}%
                    </strong>
                </div>
            )}
        </section>
    );
}
