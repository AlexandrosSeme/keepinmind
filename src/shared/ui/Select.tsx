import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import "./Select.scss";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  size = "md",
  className = "",
}) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const rect = rootRef.current?.getBoundingClientRect();
      setOpenUp(rect ? window.innerHeight - rect.bottom < 220 : false);
    }
    setOpen((currentOpen) => !currentOpen);
  };

  return (
    <div ref={rootRef} className={`km-select ${className}`.trim()}>
      <button
        type="button"
        className={`km-select__button${size === "sm" ? " is-sm" : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
      >
        <span className="text-truncate">{current?.label}</span>
        <ChevronDown size={16} aria-hidden className={open ? "is-open" : undefined} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className={`km-select__menu${openUp ? " is-up" : ""}`}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value || "__empty"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`km-select__option${selected ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
