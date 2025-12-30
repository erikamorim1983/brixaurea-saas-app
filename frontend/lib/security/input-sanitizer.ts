/**
 * Input Sanitizer
 * 
 * ISO 27001 Control: A.14.1.2 - Securing application services
 * Prevents XSS, SQL injection, and other input-based attacks
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove all HTML tags from string
 */
export function stripHtml(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Remove potentially dangerous patterns
 */
export function removeDangerousPatterns(str: string): string {
    if (!str || typeof str !== 'string') return '';

    return str
        // Remove script tags and their contents
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove on* event handlers
        .replace(/\bon\w+\s*=\s*(['"])[^'"]*\1/gi, '')
        .replace(/\bon\w+\s*=[^\s>]*/gi, '')
        // Remove javascript: URLs
        .replace(/javascript\s*:/gi, '')
        // Remove data: URLs (can contain scripts)
        .replace(/data\s*:\s*text\/html/gi, '')
        // Remove vbscript: URLs
        .replace(/vbscript\s*:/gi, '')
        // Remove expression() (IE CSS hack)
        .replace(/expression\s*\(/gi, '')
        // Remove behavior: (IE CSS hack)
        .replace(/behavior\s*:/gi, '');
}

/**
 * Validate email format (RFC 5322 simplified)
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    // Max length check
    if (email.length > 254) return false;

    // RFC 5322 compliant regex (simplified but effective)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) return false;

    // Check for valid TLD (at least 2 chars after last dot)
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const domain = parts[1];
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];

    return tld.length >= 2;
}

/**
 * Validate password strength
 * Returns an object with validation results
 */
export interface PasswordValidation {
    isValid: boolean;
    score: number; // 0-5
    errors: string[];
    suggestions: string[];
}

export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    if (!password) {
        return { isValid: false, score: 0, errors: ['Password is required'], suggestions: [] };
    }

    // Minimum length (required)
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    } else {
        score++;
    }

    // Has lowercase
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        suggestions.push('Add lowercase letters');
    }

    // Has uppercase
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        suggestions.push('Add uppercase letters');
    }

    // Has numbers
    if (/\d/.test(password)) {
        score++;
    } else {
        suggestions.push('Add numbers');
    }

    // Has special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score++;
    } else {
        suggestions.push('Add special characters (!@#$%^&*)');
    }

    // Check for common passwords (basic list)
    const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'password1', 'password123', 'admin', 'letmein', 'welcome',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common');
        score = Math.max(0, score - 2);
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
        suggestions.push('Avoid repeating characters');
    }

    return {
        isValid: errors.length === 0 && password.length >= 8,
        score: Math.min(5, score),
        errors,
        suggestions: errors.length === 0 ? suggestions : [],
    };
}

/**
 * Sanitize a text field (name, company, etc.)
 * Removes HTML, trims, and limits length
 */
export function sanitizeTextField(
    value: string,
    maxLength: number = 255
): string {
    if (!value || typeof value !== 'string') return '';

    return stripHtml(removeDangerousPatterns(value))
        .trim()
        .slice(0, maxLength);
}

/**
 * Sanitize phone number (US format)
 * Returns only digits, max 10
 */
export function sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Remove leading 1 if 11 digits (country code)
    if (digits.length === 11 && digits[0] === '1') {
        return digits.slice(1);
    }

    return digits.slice(0, 10);
}

/**
 * Sanitize ZIP code (US format)
 * Returns 5 or 9 digits only
 */
export function sanitizeZip(zip: string): string {
    if (!zip || typeof zip !== 'string') return '';

    const digits = zip.replace(/\D/g, '');

    if (digits.length >= 9) {
        return digits.slice(0, 9);
    }
    return digits.slice(0, 5);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    const trimmed = url.trim();

    // Basic protocol check
    if (trimmed && !trimmed.match(/^https?:\/\//i)) {
        return 'https://' + trimmed;
    }

    try {
        const parsed = new URL(trimmed);
        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Sanitize an entire form object
 */
export interface SanitizedFormData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName?: string;
    website?: string;
    addressZip?: string;
    [key: string]: string | undefined;
}

export function sanitizeRegistrationForm(data: Record<string, unknown>): SanitizedFormData {
    return {
        email: typeof data.email === 'string' ? data.email.toLowerCase().trim() : '',
        firstName: sanitizeTextField(data.firstName as string || '', 100),
        lastName: sanitizeTextField(data.lastName as string || '', 100),
        phone: sanitizePhone(data.phone as string || ''),
        companyName: data.companyName ? sanitizeTextField(data.companyName as string, 200) : undefined,
        website: data.website ? sanitizeUrl(data.website as string) : undefined,
        addressZip: data.addressZip ? sanitizeZip(data.addressZip as string) : undefined,
        // Pass through other validated fields
        addressStreet: sanitizeTextField(data.addressStreet as string || '', 255),
        addressSuite: sanitizeTextField(data.addressSuite as string || '', 50),
        addressCity: sanitizeTextField(data.addressCity as string || '', 100),
        addressState: sanitizeTextField(data.addressState as string || '', 2),
    };
}
