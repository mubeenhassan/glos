"use client";

import { useState, type FormEvent } from "react";
import { cx } from "@/components/cms/utils";

export type ContactFormField = {
  _key?: string;
  label: string;
  name: string;
  fieldType: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  required: boolean;
};

type ContactFormProps = {
  fields: ContactFormField[];
  submitLabel: string;
};

const labelClassName =
  "mb-[8px] block md:text-[20px] text-[14px] leading-[1.2] text-[#374151]";

const inputClassName = cx(
  "w-full rounded-[8px] border border-[#0000001A] bg-white px-4 py-3",
  "text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF]",
  "outline-none transition-colors",
  "focus:border-[#EF6C44] focus:ring-2 focus:ring-[#EF6C44]/20",
);

const submitClassName = cx(
  "mt-2 w-full rounded-[8px] bg-[#FB612E] px-6 py-3.5 cursor-pointer",
  "text-center text-[16px] font-semibold text-white",
  "transition-opacity hover:opacity-90",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ContactForm({ fields, submitLabel }: ContactFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(formData: FormData) {
    const nextErrors: Record<string, string> = {};

    for (const field of fields) {
      const raw = formData.get(field.name);
      const value = typeof raw === "string" ? raw.trim() : "";

      if (field.required && !value) {
        nextErrors[field.name] = `${field.label} is required.`;
        continue;
      }

      if (field.fieldType === "email" && value && !validateEmail(value)) {
        nextErrors[field.name] = "Please enter a valid email address.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Submission API will be wired later.
    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsSubmitting(false);
    setSubmitted(true);
    form.reset();
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <form className="flex flex-col gap-[24px]" onSubmit={handleSubmit} noValidate>
      {fields.map((field) => {
        const error = errors[field.name];
        const inputId = `contact-${field.name}`;

        return (
          <div key={field._key || field.name}>
            <label className={labelClassName} htmlFor={inputId}>
              {field.label}
              {field.required ? (
                <span className="" aria-hidden="true">
                  {" "}
                  *
                </span>
              ) : null}
            </label>
            {field.fieldType === "textarea" ? (
              <textarea
                id={inputId}
                name={field.name}
                rows={6}
                placeholder={field.placeholder}
                className={cx(inputClassName, "min-h-[140px] resize-y")}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
              />
            ) : (
              <input
                id={inputId}
                name={field.name}
                type={field.fieldType}
                placeholder={field.placeholder}
                className={inputClassName}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
              />
            )}
            {error ? (
              <p
                id={`${inputId}-error`}
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      {submitted ? (
        <p
          className="rounded-lg border border-[#E0E0E0] bg-[#F8F8F8] px-4 py-3 text-sm text-[#555555]"
          role="status"
        >
          Thank you for your message. We will be in touch soon.
        </p>
      ) : null}

      <button
        type="submit"
        className={submitClassName}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
