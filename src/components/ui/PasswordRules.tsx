import { Check } from "lucide-react";

const RULES = [
  { label: "6+ characters", test: (value: string) => value.length >= 6 },
  { label: "Uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Lowercase", test: (value: string) => /[a-z]/.test(value) },
] as const;

export interface PasswordRulesProps {
  password: string;
  className?: string;
}

/**
 * Live password checklist from the Figma sign-up screen. Visual state mirrors
 * the Zod rules, but the form schema remains the validation authority.
 */
export function PasswordRules({ password, className = "" }: PasswordRulesProps) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`} aria-live="polite">
      {RULES.map((rule) => {
        const passed = rule.test(password);

        return (
          <li
            key={rule.label}
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              passed ? "text-plum" : "text-muted"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                passed ? "bg-plum text-white" : "border border-line bg-white"
              }`}
            >
              {passed ? <Check aria-hidden="true" className="h-2.5 w-2.5" /> : null}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
