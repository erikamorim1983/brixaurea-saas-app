'use client';

import { useState } from 'react';

interface RegistrationFormProps {
    dictionary: {
        register: {
            step1: {
                title: string;
                subtitle: string;
                account_type: string;
                organization: string;
                individual: string;
                email: string;
                password: string;
                confirm_password: string;
                password_requirements: string;
            };
            step2: {
                title: string;
                subtitle: string;
                first_name: string;
                last_name: string;
                phone: string;
            };
            step3: {
                title: string;
                subtitle: string;
                company_name: string;
                ein: string;
                ein_placeholder: string;
                company_size: string;
                size_options: {
                    '1-10': string;
                    '11-50': string;
                    '51-200': string;
                    '201-500': string;
                    '500+': string;
                };
                organization_types: string;
                types: {
                    developer: string;
                    builder: string;
                    realtor: string;
                    lender: string;
                    broker: string;
                    consultant: string;
                    other: string;
                };
                website: string;
                address: string;
                suite: string;
                city: string;
                state: string;
                zip: string;
            };
            step4: {
                title: string;
                subtitle: string;
                summary: string;
                terms_label: string;
                terms_link: string;
                privacy_link: string;
            };
            buttons: {
                next: string;
                back: string;
                submit: string;
            };
            errors: {
                email_required: string;
                email_invalid: string;
                password_required: string;
                password_weak: string;
                passwords_mismatch: string;
                first_name_required: string;
                last_name_required: string;
                company_name_required: string;
                org_type_required: string;
                terms_required: string;
            };
        };
    };
    lang: string;
}

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

interface FormData {
    // Step 1
    accountType: 'individual' | 'organization';
    email: string;
    password: string;
    confirmPassword: string;
    // Step 2
    firstName: string;
    lastName: string;
    phone: string;
    // Step 3 (Organization)
    companyName: string;
    ein: string;
    companySize: string;
    organizationTypes: string[];
    website: string;
    addressStreet: string;
    addressSuite: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    // Step 4
    acceptTerms: boolean;
}

export default function RegistrationForm({ dictionary, lang }: RegistrationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        accountType: 'organization',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        companyName: '',
        ein: '',
        companySize: '',
        organizationTypes: [],
        website: '',
        addressStreet: '',
        addressSuite: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        acceptTerms: false,
    });

    const t = dictionary.register;
    const totalSteps = formData.accountType === 'organization' ? 4 : 3;

    const updateFormData = (field: keyof FormData, value: string | string[] | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const toggleOrganizationType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            organizationTypes: prev.organizationTypes.includes(type)
                ? prev.organizationTypes.filter(t => t !== type)
                : [...prev.organizationTypes, type]
        }));
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.email) newErrors.email = t.errors.email_required;
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.errors.email_invalid;
            if (!formData.password) newErrors.password = t.errors.password_required;
            else if (formData.password.length < 8) newErrors.password = t.errors.password_weak;
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.errors.passwords_mismatch;
        }

        if (step === 2) {
            if (!formData.firstName) newErrors.firstName = t.errors.first_name_required;
            if (!formData.lastName) newErrors.lastName = t.errors.last_name_required;
        }

        if (step === 3 && formData.accountType === 'organization') {
            if (!formData.companyName) newErrors.companyName = t.errors.company_name_required;
            if (formData.organizationTypes.length === 0) newErrors.organizationTypes = t.errors.org_type_required;
        }

        const finalStep = formData.accountType === 'organization' ? 4 : 3;
        if (step === finalStep) {
            if (!formData.acceptTerms) newErrors.acceptTerms = t.errors.terms_required;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            // Skip step 3 for individuals
            if (currentStep === 2 && formData.accountType === 'individual') {
                setCurrentStep(3); // This will be the review step for individuals
            } else {
                setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            }
        }
    };

    const prevStep = () => {
        if (currentStep === 3 && formData.accountType === 'individual') {
            setCurrentStep(2);
        } else {
            setCurrentStep(prev => Math.max(prev - 1, 1));
        }
    };

    const handleSubmit = async () => {
        const finalStep = formData.accountType === 'organization' ? 4 : 3;
        if (!validateStep(finalStep)) return;

        setIsSubmitting(true);
        try {
            // TODO: Call API to register user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Redirect to verification page
                window.location.href = `/${lang}/verify-email?email=${encodeURIComponent(formData.email)}`;
            } else {
                const error = await response.json();
                setErrors({ submit: error.message || 'Registration failed' });
            }
        } catch {
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine if current step is the review/final step
    const isReviewStep = (formData.accountType === 'organization' && currentStep === 4) ||
        (formData.accountType === 'individual' && currentStep === 3);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${i + 1 <= currentStep
                                    ? 'bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] transition-all duration-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step 1: Account Type & Credentials */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">{t.step1.title}</h2>
                        <p className="text-gray-600 mt-2">{t.step1.subtitle}</p>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t.step1.account_type}</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => updateFormData('accountType', 'organization')}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${formData.accountType === 'organization'
                                        ? 'border-[#00D9FF] bg-[#00D9FF]/10 text-[#081F2E]'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🏢</div>
                                <div className="font-semibold">{t.step1.organization}</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateFormData('accountType', 'individual')}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${formData.accountType === 'individual'
                                        ? 'border-[#00D9FF] bg-[#00D9FF]/10 text-[#081F2E]'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">👤</div>
                                <div className="font-semibold">{t.step1.individual}</div>
                            </button>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.step1.email}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                }`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.step1.password}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                }`}
                        />
                        <p className="text-gray-500 text-xs mt-1">{t.step1.password_requirements}</p>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.step1.confirm_password}</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                }`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">{t.step2.title}</h2>
                        <p className="text-gray-600 mt-2">{t.step2.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step2.first_name}</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => updateFormData('firstName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                    }`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step2.last_name}</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => updateFormData('lastName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                    }`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.step2.phone}</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Organization Info (only for organizations) */}
            {currentStep === 3 && formData.accountType === 'organization' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">{t.step3.title}</h2>
                        <p className="text-gray-600 mt-2">{t.step3.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.company_name}</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => updateFormData('companyName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.companyName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                    }`}
                            />
                            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.ein}</label>
                            <input
                                type="text"
                                value={formData.ein}
                                onChange={(e) => {
                                    // Format EIN as XX-XXXXXXX
                                    let value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    if (value.length > 2) {
                                        value = value.slice(0, 2) + '-' + value.slice(2);
                                    }
                                    updateFormData('ein', value);
                                }}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                                placeholder={t.step3.ein_placeholder}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.company_size}</label>
                            <select
                                value={formData.companySize}
                                onChange={(e) => updateFormData('companySize', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                            >
                                <option value="">Select...</option>
                                {Object.entries(t.step3.size_options).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Organization Types (Multi-select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t.step3.organization_types}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(t.step3.types).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleOrganizationType(key)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${formData.organizationTypes.includes(key)
                                            ? 'border-[#00D9FF] bg-[#00D9FF]/10 text-[#081F2E]'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {errors.organizationTypes && <p className="text-red-500 text-sm mt-1">{errors.organizationTypes}</p>}
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.website}</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => updateFormData('website', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                            placeholder="https://www.example.com"
                        />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.address}</label>
                            <input
                                type="text"
                                value={formData.addressStreet}
                                onChange={(e) => updateFormData('addressStreet', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                                placeholder="123 Main Street"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.suite}</label>
                            <input
                                type="text"
                                value={formData.addressSuite}
                                onChange={(e) => updateFormData('addressSuite', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                                placeholder="Suite 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.city}</label>
                            <input
                                type="text"
                                value={formData.addressCity}
                                onChange={(e) => updateFormData('addressCity', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.state}</label>
                            <select
                                value={formData.addressState}
                                onChange={(e) => updateFormData('addressState', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                            >
                                <option value="">Select...</option>
                                {US_STATES.map(state => (
                                    <option key={state.value} value={state.value}>{state.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step3.zip}</label>
                            <input
                                type="text"
                                value={formData.addressZip}
                                onChange={(e) => updateFormData('addressZip', e.target.value.replace(/\D/g, '').slice(0, 9))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]"
                                placeholder="12345"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4 (or 3 for individuals): Review & Submit */}
            {isReviewStep && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">{t.step4.title}</h2>
                        <p className="text-gray-600 mt-2">{t.step4.subtitle}</p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                        <h3 className="font-semibold text-lg text-[#081F2E]">{t.step4.summary}</h3>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <p className="font-medium">{formData.email}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">{t.step1.account_type}:</span>
                                <p className="font-medium">
                                    {formData.accountType === 'organization' ? t.step1.organization : t.step1.individual}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">{t.step2.first_name}:</span>
                                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                            </div>
                            {formData.phone && (
                                <div>
                                    <span className="text-gray-500">{t.step2.phone}:</span>
                                    <p className="font-medium">{formData.phone}</p>
                                </div>
                            )}

                            {formData.accountType === 'organization' && (
                                <>
                                    <div className="col-span-2 border-t pt-4 mt-2">
                                        <span className="text-gray-500">{t.step3.company_name}:</span>
                                        <p className="font-medium">{formData.companyName}</p>
                                    </div>
                                    {formData.ein && (
                                        <div>
                                            <span className="text-gray-500">{t.step3.ein}:</span>
                                            <p className="font-medium">{formData.ein}</p>
                                        </div>
                                    )}
                                    {formData.organizationTypes.length > 0 && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">{t.step3.organization_types}:</span>
                                            <p className="font-medium">
                                                {formData.organizationTypes.map(type => t.step3.types[type as keyof typeof t.step3.types]).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.acceptTerms}
                            onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#00D9FF] focus:ring-[#00D9FF]"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            {t.step4.terms_label}{' '}
                            <a href={`/${lang}/terms`} className="text-[#00D9FF] hover:underline">{t.step4.terms_link}</a>
                            {' '}&{' '}
                            <a href={`/${lang}/privacy`} className="text-[#00D9FF] hover:underline">{t.step4.privacy_link}</a>
                        </label>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}
                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                            {errors.submit}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all duration-300"
                    >
                        {t.buttons.back}
                    </button>
                ) : (
                    <div />
                )}

                {isReviewStep ? (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? '...' : t.buttons.submit}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="btn-primary px-8 py-3 rounded-xl font-semibold"
                    >
                        {t.buttons.next}
                    </button>
                )}
            </div>
        </div>
    );
}
