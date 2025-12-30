'use client';

import { useState, useRef } from 'react';

// US States
const US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

const ORGANIZATION_TYPES = [
    { value: 'developer', label: 'Developer' },
    { value: 'builder', label: 'Builder' },
    { value: 'realtor', label: 'Realtor' },
    { value: 'lender', label: 'Lender' },
    { value: 'broker', label: 'Broker' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'other', label: 'Other' },
];

interface ProfileFormProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        accountType: string;
        companyName: string;
        ein: string;
        website: string;
        logoUrl: string;
        addressStreet: string;
        addressSuite: string;
        addressCity: string;
        addressState: string;
        addressZip: string;
        organizationTypes: string[];
    };
}

// Phone mask: (###) ###-####
const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 10);
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
};

// EIN mask: ##-#######
const formatEIN = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 9);
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
};

export default function ProfileForm({ lang, dictionary, initialData }: ProfileFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl || null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = dictionary.settings?.profile || {};
    const regT = dictionary.register?.step3 || {};

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhone(value);
        updateField('phone', formatted);
    };

    const handleEINChange = (value: string) => {
        const formatted = formatEIN(value);
        updateField('ein', formatted);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrorMessage('Image must be less than 2MB');
            return;
        }

        setIsUploadingLogo(true);
        setErrorMessage('');

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('/api/user/upload-logo', {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                updateField('logoUrl', data.url);
            } else {
                const data = await response.json();
                setErrorMessage(data.error || 'Failed to upload logo');
                setLogoPreview(initialData.logoUrl || null);
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            setErrorMessage('Failed to upload logo');
            setLogoPreview(initialData.logoUrl || null);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        setErrorMessage('');

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    accountType: formData.accountType,
                    companyName: formData.companyName,
                    ein: formData.ein,
                    website: formData.website,
                    logoUrl: formData.logoUrl,
                    addressStreet: formData.addressStreet,
                    addressSuite: formData.addressSuite,
                    addressCity: formData.addressCity,
                    addressState: formData.addressState,
                    addressZip: formData.addressZip,
                    organizationTypes: formData.organizationTypes,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('saved');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setErrorMessage(data.details || data.error || t.error || 'Error saving');
                setStatus('error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setErrorMessage(t.error || 'Error saving');
            setStatus('error');
        }
    };

    const updateField = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (status === 'saved' || status === 'error') setStatus('idle');
    };

    const toggleOrganizationType = (type: string) => {
        const current = formData.organizationTypes || [];
        if (current.includes(type)) {
            updateField('organizationTypes', current.filter(t => t !== type));
        } else {
            updateField('organizationTypes', [...current, type]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Upload Section - Only for organizations */}
            {formData.accountType === 'organization' && (
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                    <div
                        className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-cyan-400 transition-colors cursor-pointer overflow-hidden bg-white"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploadingLogo ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="animate-spin w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            </div>
                        ) : logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-700">{t.company_logo || 'Company Logo'}</h3>
                        <p className="text-sm text-gray-500">{t.logo_hint || 'Used in reports and documents'}</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 2MB)</p>
                    </div>
                </div>
            )}

            {/* Basic Info Section */}
            <div>
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t.basic_info || 'Basic Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.first_name || 'First Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.last_name || 'Last Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            required
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.email || 'Email'}
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Phone with mask */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.phone || 'Phone'}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="(555) 123-4567"
                        />
                    </div>
                </div>
            </div>



            {/* Organization Info - Only visible when organization is selected */}
            {formData.accountType === 'organization' && (
                <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {t.company_info || 'Company Information'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {regT.company_name || 'Company Name'}
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => updateField('companyName', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="Acme Corporation"
                            />
                        </div>

                        {/* EIN with mask */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {regT.ein || 'EIN (Employer Identification Number)'}
                            </label>
                            <input
                                type="text"
                                value={formData.ein}
                                onChange={(e) => handleEINChange(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="12-3456789"
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {regT.website || 'Website'}
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => updateField('website', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Types */}
            <div>
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {regT.organization_types || 'Professional Type'}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {ORGANIZATION_TYPES.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => toggleOrganizationType(type.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.organizationTypes?.includes(type.value)
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {dictionary.register?.step3?.types?.[type.value as keyof typeof dictionary.register.step3.types] || type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Address Section */}
            <div>
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.address || 'Address'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{regT.address || 'Street Address'}</label>
                        <input
                            type="text"
                            value={formData.addressStreet}
                            onChange={(e) => updateField('addressStreet', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="123 Main Street"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{regT.suite || 'Suite/Unit'}</label>
                        <input
                            type="text"
                            value={formData.addressSuite}
                            onChange={(e) => updateField('addressSuite', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="Suite 100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{regT.city || 'City'}</label>
                        <input
                            type="text"
                            value={formData.addressCity}
                            onChange={(e) => updateField('addressCity', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="Miami"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{regT.state || 'State'}</label>
                        <select
                            value={formData.addressState}
                            onChange={(e) => updateField('addressState', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all bg-white"
                        >
                            <option value="">Select State</option>
                            {US_STATES.map((state) => (
                                <option key={state.value} value={state.value}>{state.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{regT.zip || 'ZIP Code'}</label>
                        <input
                            type="text"
                            value={formData.addressZip}
                            onChange={(e) => updateField('addressZip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="33101"
                            maxLength={5}
                        />
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {status === 'saved' && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.saved || 'Changes saved!'}
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {errorMessage || t.error || 'Error saving changes'}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={status === 'saving' || !formData.firstName || !formData.lastName}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {status === 'saving' ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            {t.saving || 'Saving...'}
                        </span>
                    ) : t.save || 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
