"use client";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  note?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, note, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={
            `w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${className}`
          }
          {...props}
        />
        {note && (
          <p className="mt-1 text-[11px] text-gray-600">{note}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;


