// src/components/WhatsAppButton.jsx
import React from 'react';

const DEFAULT_COUNTRY_CODE = '234'; // Nigeria

/**
 * Converts a phone number the way users type it into the international
 * digits-only format WhatsApp needs (no "+", spaces or leading zeros).
 *
 *   08012345678       -> 2348012345678
 *   +234 801 234 5678 -> 2348012345678
 *   +234 (0)801...    -> 2348012345678
 *   2348012345678     -> 2348012345678
 *   8012345678        -> 2348012345678
 *
 * Returns null when the number can't be a valid phone number.
 */
export const toWhatsAppNumber = (raw, countryCode = DEFAULT_COUNTRY_CODE) => {
  if (!raw) return null;

  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2); // 00234... -> 234...

  if (digits.startsWith(countryCode)) {
    // "+234 (0)801..." style: drop the stray trunk zero
    if (digits.startsWith(`${countryCode}0`)) digits = countryCode + digits.slice(countryCode.length + 1);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = countryCode + digits.slice(1); // 0801... -> 234801...
  } else if (digits.length === 10) {
    digits = countryCode + digits; // 801... -> 234801...
  }

  return digits.length >= 11 && digits.length <= 15 ? digits : null;
};

/** Builds a wa.me link that opens a chat with the number (optionally pre-filled). */
export const buildWhatsAppLink = (phone, message) => {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

// WhatsApp logo (lucide has no brand icons)
const WhatsAppIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/**
 * Opens a WhatsApp chat with the given number.
 * Renders nothing if the number is missing or invalid.
 *
 * variant="button": green pill with label (for action rows)
 * variant="icon":   round icon only (for tight spaces)
 */
const WhatsAppButton = ({
  phone,
  message,
  label = 'WhatsApp',
  variant = 'button',
  className = '',
}) => {
  const url = buildWhatsAppLink(phone, message);
  if (!url) return null;

  const common = {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: (e) => e.stopPropagation(),
  };

  if (variant === 'icon') {
    return (
      <a
        {...common}
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white transition-colors shrink-0 ${className}`}
      >
        <WhatsAppIcon />
      </a>
    );
  }

  return (
    <a
      {...common}
      className={`flex-1 sm:flex-none px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
};

export default WhatsAppButton;