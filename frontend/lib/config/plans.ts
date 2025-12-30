/**
 * Centralized Plans Configuration
 * Single source of truth for all subscription plans
 * 
 * Used by:
 * - Registration Form (frontend)
 * - API Route (backend)
 * - Database seeding
 */

export interface Plan {
    id: string;
    name: string;
    price: number;           // Monthly price in USD
    priceYearly: number;     // Yearly price in USD
    trialDays: number;
    maxUsers: number;        // -1 = unlimited
    maxProjects: number;     // -1 = unlimited
    maxStorageMb: number;    // -1 = unlimited
    features: string[];
    isPopular: boolean;
    isOrganization: boolean;
    displayOrder: number;
    // Stripe integration
    stripePriceMonthly?: string;
    stripePriceYearly?: string;
}

export const PLANS: Plan[] = [
    // ⚠️ DEV PLAN - Remove before production
    {
        id: 'dev_plan',
        name: 'DEV',
        price: 0,
        priceYearly: 0,
        trialDays: 999, // ~3 years
        maxUsers: -1,
        maxProjects: -1,
        maxStorageMb: -1,
        features: ['unlimited_everything', 'api_access', 'priority_support'],
        isPopular: false,
        isOrganization: false,
        displayOrder: 0,
    },
    {
        id: 'individual',
        name: 'Individual',
        price: 49.90,
        priceYearly: 499,
        trialDays: 7,
        maxUsers: 1,
        maxProjects: 5,
        maxStorageMb: 2048,
        features: [
            'basic_analysis',
            'limited_projects',
            'storage_2gb',
            'email_support'
        ],
        isPopular: false,
        isOrganization: false,
        displayOrder: 1,
        stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_MONTHLY,
        stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_YEARLY,
    },
    {
        id: 'business_starter',
        name: 'Business Starter',
        price: 99.90,
        priceYearly: 999,
        trialDays: 14,
        maxUsers: 3,
        maxProjects: -1,
        maxStorageMb: 10240,
        features: [
            'unlimited_projects',
            'team_3_members',
            'storage_10gb',
            'priority_support',
            'team_management'
        ],
        isPopular: true,
        isOrganization: true,
        displayOrder: 2,
        stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
        stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY,
    },
    {
        id: 'business_pro',
        name: 'Business Pro',
        price: 149.90,
        priceYearly: 1499,
        trialDays: 14,
        maxUsers: 10,
        maxProjects: -1,
        maxStorageMb: 51200,
        features: [
            'unlimited_projects',
            'team_10_members',
            'storage_50gb',
            'priority_support',
            'team_management',
            'advanced_reports'
        ],
        isPopular: false,
        isOrganization: true,
        displayOrder: 3,
        stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
        stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    },
    {
        id: 'business_plus',
        name: 'Business Plus',
        price: 499.90,
        priceYearly: 4999,
        trialDays: 14,
        maxUsers: 25,
        maxProjects: -1,
        maxStorageMb: 102400,
        features: [
            'unlimited_projects',
            'team_25_members',
            'storage_100gb',
            'priority_support',
            'team_management',
            'advanced_reports',
            'api_access'
        ],
        isPopular: false,
        isOrganization: true,
        displayOrder: 4,
        stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_MONTHLY,
        stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_YEARLY,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 0, // Custom pricing
        priceYearly: 0,
        trialDays: 0,
        maxUsers: -1,
        maxProjects: -1,
        maxStorageMb: -1,
        features: [
            'unlimited_everything',
            'custom_integrations',
            'dedicated_support',
            'sla_guarantee',
            'custom_branding'
        ],
        isPopular: false,
        isOrganization: true,
        displayOrder: 5,
    },
];

// Helper functions
export function getPlanById(planId: string): Plan | undefined {
    return PLANS.find(p => p.id === planId);
}

export function getTrialDays(planId: string): number {
    return getPlanById(planId)?.trialDays ?? 7;
}

export function isOrganizationPlan(planId: string): boolean {
    return getPlanById(planId)?.isOrganization ?? false;
}

export function getAccountType(planId: string): 'individual' | 'organization' {
    return isOrganizationPlan(planId) ? 'organization' : 'individual';
}

// US States for address form
export const US_STATES = [
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

// Organization types with labels for form display
export const ORGANIZATION_TYPES = [
    { value: 'developer', label: 'Developer' },
    { value: 'builder', label: 'Builder' },
    { value: 'realtor', label: 'Realtor' },
    { value: 'lender', label: 'Lender' },
    { value: 'broker', label: 'Broker' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'other', label: 'Other' },
] as const;

export type OrganizationType = typeof ORGANIZATION_TYPES[number]['value'];

// Helper to format storage for display
export function formatStorage(mb: number): string {
    if (mb === -1) return 'Unlimited';
    if (mb >= 1024) return `${Math.round(mb / 1024)}GB`;
    return `${mb}MB`;
}

// Helper to format users for display
export function formatUsers(maxUsers: number): string {
    if (maxUsers === -1) return 'Unlimited';
    return maxUsers.toString();
}

// Helper to format projects for display  
export function formatProjects(maxProjects: number): string {
    if (maxProjects === -1) return 'Unlimited';
    return maxProjects.toString();
}

// Billing frequency type
export type BillingFrequency = 'monthly' | 'yearly';

// Helper to format price with 2 decimal places
export function formatPrice(price: number): string {
    return price.toFixed(2);
}

// Helper to calculate annual savings
export function calculateAnnualSavings(plan: Plan): number {
    const monthlyTotal = plan.price * 12;
    return Number((monthlyTotal - plan.priceYearly).toFixed(2));
}

// Helper to get discount percentage
export function getDiscountPercentage(plan: Plan): number {
    const monthlyTotal = plan.price * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - plan.priceYearly) / monthlyTotal) * 100);
}

// Helper to get price based on billing frequency
export function getPriceByFrequency(plan: Plan, frequency: BillingFrequency): number {
    return frequency === 'yearly' ? plan.priceYearly : plan.price;
}

// Helper to get monthly equivalent for yearly billing
export function getMonthlyEquivalent(plan: Plan): number {
    return Number((plan.priceYearly / 12).toFixed(2));
}
