// src/components/PasswordStrengthMeter.jsx
import React, { useMemo } from 'react';

const RULES = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]/~`]/.test(pw) },
];

const PasswordStrengthMeter = ({ password = '' }) => {
  const results = useMemo(() => RULES.map((r) => ({ ...r, passed: r.test(password) })), [password]);
  const passedCount = results.filter((r) => r.passed).length;

  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][passedCount - 1] || '';
  const barColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passedCount - 1] || 'bg-gray-200';

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < passedCount ? barColor : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {strengthLabel && (
        <p className="text-xs font-medium text-gray-600 mb-1">{strengthLabel}</p>
      )}
      <ul className="text-xs space-y-0.5">
        {results.map((r) => (
          <li key={r.label} className={r.passed ? 'text-green-600' : 'text-gray-400'}>
            {r.passed ? '✓' : '○'} {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;