
import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value?: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    className?: string;
    name?: string;
    onBlur?: () => void;
    readOnly?: boolean;
}

export const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return '';
    // Format using US locale
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

export const parseCurrency = (value: string): number => {
    // Remove non-numeric chars except dot
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const numberValue = parseFloat(cleanValue);
    return isNaN(numberValue) ? 0 : numberValue;
};

export default function CurrencyInput({ value, onChange, placeholder, min = 0, className, name, onBlur, readOnly }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));

    // Sync external value changes to display state
    useEffect(() => {
        // Only update if the parsed display value is different from the prop value
        // This prevents cursor jumping or re-formatting while typing if we were to strictly sync
        const parsedDisplay = parseCurrency(displayValue);
        if (value !== undefined && value !== parsedDisplay) {
            // Special case: if user is typing "1000." don't overwrite with "1,000" yet
            // usage of useEffect like this is tricky. 
            // Better approach: 
            setDisplayValue(formatCurrency(value));
        }
    }, [value]); // Relying on parent to pass updated value. 

    // Actually, distinct local state is better for inputs. 
    // Let's refine:
    // When prop `value` changes, we update `displayValue` IF it's not the one driving the change (focused).
    // Using a simpler approach: 
    // When focused, show raw number or allowed chars. When blurred, show formatted.

    // RE-THINKING: The user wants masks. 
    // Standard approach: 
    // 1. User types numbers. 
    // 2. We format as they type `1,000`. 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Allow ONLY numbers and one decimal point
        // Check for invalid chars (like multiple dots or non-digits)
        const validChars = /^[0-9,]*\.?[0-9]*$/;
        if (!validChars.test(inputValue)) return;

        // Remove commas to get raw number string (e.g. "1,000.50" -> "1000.50")
        const rawString = inputValue.replace(/,/g, '');

        // Validations
        // 1. Prevent negative if min >= 0 (handled by regex mainly, but let's be safe)
        if (min >= 0 && rawString.includes('-')) return;

        // Update display value immediately to allow typing
        // But we want to preserve cursor position logic or just simple masking.
        // Simple masking: 
        // 12 -> 12
        // 123 -> 123
        // 1234 -> 1,234

        // Let's try to format ON TYPING
        const parts = rawString.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : ''; // Limit to 2 decimals

        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const newDisplayValue = formattedInteger + decimalPart;

        setDisplayValue(newDisplayValue);

        // Propagate number change
        const numberValue = parseFloat(rawString);
        onChange(isNaN(numberValue) ? 0 : numberValue);
    };

    const handleBlur = () => {
        // Ensure proper formatting on blur (e.g., adding .00 optional or cleanup)
        // For now, keep as is or re-format strictly
        if (value !== undefined && value !== null) {
            if (value !== 0) {
                const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                setDisplayValue(formatted);
            }
        }
        if (onBlur) onBlur();
    };

    // Block invalid chars on keydown just in case
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={className}
            name={name}
            autoComplete="off"
            readOnly={readOnly}
        />
    );
}
