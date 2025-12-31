'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS, US_STATES, ORGANIZATION_TYPES, getPlanById, formatStorage } from '@/lib/config/plans';

// Eye icons for password toggle
const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

// Filter plans to only show non-enterprise plans in registration
const REGISTRATION_PLANS = PLANS.filter(p => p.id !== 'enterprise');

interface RegistrationFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
    lang: string;
    preselectedPlan?: string;
    preselectedBilling?: 'monthly' | 'yearly';
}

interface FormData {
    planId: string;
    billingFrequency: 'monthly' | 'yearly';
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
    ein: string;
    organizationTypes: string[];
    website: string;
    addressStreet: string;
    addressSuite: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    acceptTerms: boolean;
}

// Internal translations for registration form
const formContent = {
    en: {
        step1: { title: 'Choose Your Plan', subtitle: 'Start with a free trial, cancel anytime' },
        step2: { title: 'Your Details', subtitle: 'Information to create your account', first_name: 'First Name', last_name: 'Last Name', phone: 'Phone', email: 'Email', password: 'Password', confirm_password: 'Confirm Password', password_hint: 'Minimum 8 characters' },
        step3: { title: 'Company Details', subtitle: 'Tell us about your organization', company_name: 'Company Name', ein: 'EIN (optional)', org_type: 'Organization Type', org_type_hint: 'Select all that apply', website: 'Website (optional)', address: 'Address', street: 'Street', suite: 'Suite/Unit', city: 'City', state: 'State', zip: 'ZIP Code' },
        step4: { title: 'Confirm & Create', subtitle: 'Review your information', terms_prefix: 'I have read and accept the', terms_link: 'Terms of Service', terms_and: 'and the', privacy_link: 'Privacy Policy' },
        plan: { popular: 'Most Popular', users: 'users', user: 'user', up_to: 'Up to', projects: 'projects', unlimited_projects: 'Unlimited projects', storage: 'storage', per_month: '/mo', trial: 'days free trial', enterprise_cta: 'Need more?', enterprise_link: 'Contact us for Enterprise', selected_plan: 'Selected Plan' },
        buttons: { back: 'Back', next: 'Continue', submit: 'Create Account', creating: 'Creating account...' },
        summary: { name: 'Name:', email: 'Email:', company: 'Company:', trial_info: 'free trial - No charges until trial ends' },
        errors: { select_plan: 'Select a plan' }
    },
    pt: {
        step1: { title: 'Escolha seu Plano', subtitle: 'Comece com um trial grátis, cancele quando quiser' },
        step2: { title: 'Seus Dados', subtitle: 'Informações para criar sua conta', first_name: 'Nome', last_name: 'Sobrenome', phone: 'Telefone', email: 'Email', password: 'Senha', confirm_password: 'Confirmar Senha', password_hint: 'Mínimo 8 caracteres' },
        step3: { title: 'Dados da Empresa', subtitle: 'Conte-nos sobre sua organização', company_name: 'Nome da Empresa', ein: 'CNPJ (opcional)', org_type: 'Tipo de Organização', org_type_hint: 'Selecione todos que se aplicam', website: 'Website (opcional)', address: 'Endereço', street: 'Rua', suite: 'Complemento', city: 'Cidade', state: 'Estado', zip: 'CEP' },
        step4: { title: 'Confirmar e Criar', subtitle: 'Revise suas informações', terms_prefix: 'Li e aceito os', terms_link: 'Termos de Serviço', terms_and: 'e a', privacy_link: 'Política de Privacidade' },
        plan: { popular: 'Mais Popular', users: 'usuários', user: 'usuário', up_to: 'Até', projects: 'projetos', unlimited_projects: 'Projetos ilimitados', storage: 'armazenamento', per_month: '/mês', trial: 'dias de trial grátis', enterprise_cta: 'Precisa de mais?', enterprise_link: 'Entre em contato para Enterprise', selected_plan: 'Plano Selecionado' },
        buttons: { back: 'Voltar', next: 'Continuar', submit: 'Criar Conta', creating: 'Criando conta...' },
        summary: { name: 'Nome:', email: 'Email:', company: 'Empresa:', trial_info: 'de trial grátis - Sem cobranças até o final do trial' },
        errors: { select_plan: 'Selecione um plano' }
    },
    es: {
        step1: { title: 'Elige tu Plan', subtitle: 'Comienza con una prueba gratis, cancela cuando quieras' },
        step2: { title: 'Tus Datos', subtitle: 'Información para crear tu cuenta', first_name: 'Nombre', last_name: 'Apellido', phone: 'Teléfono', email: 'Email', password: 'Contraseña', confirm_password: 'Confirmar Contraseña', password_hint: 'Mínimo 8 caracteres' },
        step3: { title: 'Datos de la Empresa', subtitle: 'Cuéntanos sobre tu organización', company_name: 'Nombre de la Empresa', ein: 'NIF (opcional)', org_type: 'Tipo de Organización', org_type_hint: 'Selecciona todos los que apliquen', website: 'Sitio Web (opcional)', address: 'Dirección', street: 'Calle', suite: 'Piso/Unidad', city: 'Ciudad', state: 'Estado', zip: 'Código Postal' },
        step4: { title: 'Confirmar y Crear', subtitle: 'Revisa tu información', terms_prefix: 'He leído y acepto los', terms_link: 'Términos de Servicio', terms_and: 'y la', privacy_link: 'Política de Privacidad' },
        plan: { popular: 'Más Popular', users: 'usuarios', user: 'usuario', up_to: 'Hasta', projects: 'proyectos', unlimited_projects: 'Proyectos ilimitados', storage: 'almacenamiento', per_month: '/mes', trial: 'días de prueba gratis', enterprise_cta: '¿Necesitas más?', enterprise_link: 'Contáctanos para Enterprise', selected_plan: 'Plan Seleccionado' },
        buttons: { back: 'Volver', next: 'Continuar', submit: 'Crear Cuenta', creating: 'Creando cuenta...' },
        summary: { name: 'Nombre:', email: 'Email:', company: 'Empresa:', trial_info: 'de prueba gratis - Sin cargos hasta que termine la prueba' },
        errors: { select_plan: 'Selecciona un plan' }
    }
};


export default function RegistrationForm({ dictionary, lang, preselectedPlan, preselectedBilling }: RegistrationFormProps) {
    // Validate preselectedPlan against available plans
    const validPreselectedPlan = preselectedPlan && REGISTRATION_PLANS.some(p => p.id === preselectedPlan)
        ? preselectedPlan
        : 'business_starter';

    // Validate preselectedBilling
    const validPreselectedBilling = preselectedBilling === 'yearly' ? 'yearly' : 'monthly';

    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        planId: validPreselectedPlan,
        billingFrequency: validPreselectedBilling,
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        companyName: '',
        ein: '',
        organizationTypes: [],
        website: '',
        addressStreet: '',
        addressSuite: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        acceptTerms: false,
    });

    const t = dictionary.register || {};
    const c = formContent[lang as keyof typeof formContent] || formContent.en;
    const selectedPlan = PLANS.find(p => p.id === formData.planId) || PLANS[1];
    const isBusinessPlan = selectedPlan.isOrganization;
    const totalSteps = isBusinessPlan ? 4 : 3;

    const updateFormData = (field: keyof FormData, value: string | string[] | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            if (!formData.planId) newErrors.planId = c.errors.select_plan;
        }

        if (step === 2) {
            if (!formData.email) newErrors.email = t.errors?.email_required || 'Email required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.errors?.email_invalid || 'Invalid email';
            if (!formData.password) newErrors.password = t.errors?.password_required || 'Password required';
            else if (formData.password.length < 8) newErrors.password = t.errors?.password_weak || 'Min 8 characters';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.errors?.passwords_mismatch || 'Passwords do not match';
            if (!formData.firstName) newErrors.firstName = t.errors?.first_name_required || 'First name required';
            if (!formData.lastName) newErrors.lastName = t.errors?.last_name_required || 'Last name required';
        }

        if (step === 3 && isBusinessPlan) {
            if (!formData.companyName) newErrors.companyName = t.errors?.company_name_required || 'Company name required';
        }

        const finalStep = isBusinessPlan ? 4 : 3;
        if (step === finalStep) {
            if (!formData.acceptTerms) newErrors.acceptTerms = t.errors?.terms_required || 'Accept terms to continue';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(totalSteps)) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    lang,
                    // Derive accountType from plan
                    accountType: isBusinessPlan ? 'organization' : 'individual',
                }),
            });

            if (response.ok) {
                window.location.href = `/${lang}/auth/verify-email?email=${encodeURIComponent(formData.email)}`;
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

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${i + 1 <= currentStep
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

            {/* Step 1: Choose Plan */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">
                            {c.step1.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {c.step1.subtitle}
                        </p>
                    </div>

                    {/* Billing Frequency Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1.5">
                            <button
                                type="button"
                                onClick={() => updateFormData('billingFrequency', 'monthly')}
                                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${formData.billingFrequency === 'monthly'
                                    ? 'bg-white text-[#081F2E] shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {lang === 'pt' ? 'Mensal' : lang === 'es' ? 'Mensual' : 'Monthly'}
                            </button>
                            <button
                                type="button"
                                onClick={() => updateFormData('billingFrequency', 'yearly')}
                                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${formData.billingFrequency === 'yearly'
                                    ? 'bg-white text-[#081F2E] shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {lang === 'pt' ? 'Anual' : lang === 'es' ? 'Anual' : 'Yearly'}
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    ~17% OFF
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {REGISTRATION_PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => updateFormData('planId', plan.id)}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${formData.planId === plan.id
                                    ? 'border-[#00D9FF] bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg shadow-cyan-100'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white text-xs font-semibold rounded-full">
                                        {c.plan.popular}
                                    </span>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {plan.trialDays} {c.plan.trial}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-gray-800">
                                            ${formData.billingFrequency === 'yearly'
                                                ? (plan.priceYearly / 12).toFixed(2)
                                                : plan.price.toFixed(2)}
                                        </span>
                                        <span className="text-gray-500 text-sm">{c.plan.per_month}</span>
                                        {formData.billingFrequency === 'yearly' && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                ${plan.priceYearly.toFixed(2)}/ano
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#00D9FF]">👤</span>
                                        <span>{plan.maxUsers === 1 ? `1 ${c.plan.user}` : `${c.plan.up_to} ${plan.maxUsers} ${c.plan.users}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#00D9FF]">📁</span>
                                        <span>{plan.maxProjects === -1 ? c.plan.unlimited_projects : `${plan.maxProjects} ${c.plan.projects}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#00D9FF]">💾</span>
                                        <span>{formatStorage(plan.maxStorageMb)} {c.plan.storage}</span>
                                    </div>
                                </div>
                                {formData.planId === plan.id && (
                                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#00D9FF] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Enterprise CTA */}
                    <div className="text-center mt-6 p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-600">
                            {c.plan.enterprise_cta} <a href={`/${lang}/contact?plan=enterprise`} className="text-[#00D9FF] font-semibold hover:underline">{c.plan.enterprise_link}</a>
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">
                            {c.step2.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {c.step2.subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {c.step2.first_name} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => updateFormData('firstName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {c.step2.last_name} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => updateFormData('lastName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {c.step2.email} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {c.step2.phone}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {c.step2.password} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{c.step2.password_hint}</p>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {c.step2.confirm_password} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>
            )}

            {/* Step 3: Company Info (Business plans only) */}
            {currentStep === 3 && isBusinessPlan && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">
                            {c.step3.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {c.step3.subtitle}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {c.step3.company_name} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => updateFormData('companyName', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.companyName ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                            placeholder="Your Company LLC"
                        />
                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {c.step3.ein}
                            </label>
                            <input
                                type="text"
                                value={formData.ein}
                                onChange={(e) => updateFormData('ein', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                placeholder="12-3456789"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {c.step3.website}
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => updateFormData('website', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {c.step3.org_type}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ORGANIZATION_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => toggleOrganizationType(type.value)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.organizationTypes.includes(type.value)
                                        ? 'bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {t.step3?.types?.[type.value] || type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {c.step3.address}
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={formData.addressStreet}
                                onChange={(e) => updateFormData('addressStreet', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                placeholder={c.step3.street}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={formData.addressSuite}
                                    onChange={(e) => updateFormData('addressSuite', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                    placeholder={c.step3.suite}
                                />
                                <input
                                    type="text"
                                    value={formData.addressCity}
                                    onChange={(e) => updateFormData('addressCity', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                    placeholder={c.step3.city}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={formData.addressState}
                                    onChange={(e) => updateFormData('addressState', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 bg-white"
                                >
                                    <option value="">{c.step3.state}</option>
                                    {US_STATES.map((state) => (
                                        <option key={state.value} value={state.value}>{state.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={formData.addressZip}
                                    onChange={(e) => updateFormData('addressZip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
                                    placeholder={c.step3.zip}
                                    maxLength={5}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3/4: Confirmation */}
            {((currentStep === 3 && !isBusinessPlan) || (currentStep === 4 && isBusinessPlan)) && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#081F2E]">
                            {c.step4.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {c.step4.subtitle}
                        </p>
                    </div>

                    {/* Plan Summary */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm">{c.plan.selected_plan}</p>
                                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">${selectedPlan.price.toFixed(2)}<span className="text-sm text-slate-400">{c.plan.per_month}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg text-green-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">
                                🎉 {selectedPlan.trialDays} {c.summary.trial_info}
                            </span>
                        </div>
                    </div>

                    {/* User Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">{c.summary.name}</span>
                            <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">{c.summary.email}</span>
                            <span className="font-medium">{formData.email}</span>
                        </div>
                        {isBusinessPlan && formData.companyName && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">{c.summary.company}</span>
                                <span className="font-medium">{formData.companyName}</span>
                            </div>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#00D9FF] focus:ring-[#00D9FF] mt-0.5"
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                            {c.step4.terms_prefix}{' '}
                            <Link href={`/${lang}/terms`} className="text-[#00D9FF] hover:underline">
                                {c.step4.terms_link}
                            </Link>{' '}
                            {c.step4.terms_and}{' '}
                            <Link href={`/${lang}/privacy`} className="text-[#00D9FF] hover:underline">
                                {c.step4.privacy_link}
                            </Link>
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
                        className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                    >
                        ← {c.buttons.back}
                    </button>
                ) : (
                    <div />
                )}

                {currentStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                    >
                        {c.buttons.next} →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.acceptTerms}
                        className="px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                {c.buttons.creating}
                            </span>
                        ) : (
                            <>🚀 {c.buttons.submit}</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
