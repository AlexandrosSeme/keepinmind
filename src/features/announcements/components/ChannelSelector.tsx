import React from "react";
import type { MessageChannel } from "../types";

const OPTIONS: { value: MessageChannel; label: string }[] = [
  { value: "sms", label: "SMS" },
  { value: "viber", label: "Viber" },
  { value: "email", label: "Email" },
  { value: "both", label: "SMS + Email" },
];

interface ChannelSelectorProps {
  value: MessageChannel;
  onChange: (value: MessageChannel) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  value,
  onChange,
}) => (
  <div className="d-flex gap-3 flex-wrap">
    {OPTIONS.map((option) => (
      <div key={option.value} className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="channel"
          id={option.value}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
        />
        <label className="form-check-label" htmlFor={option.value}>
          {option.label}
        </label>
      </div>
    ))}
  </div>
);

export default ChannelSelector;
