import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { SendResult } from "../types";

const URL_PATTERN = /(https?:\/\/[^\s]+)/;

/** Renders a line, turning any URLs into links. */
const LinkifiedLine: React.FC<{ line: string }> = ({ line }) => (
  <span>
    {line.split(URL_PATTERN).map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-underline"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </span>
);

const SendResultAlert: React.FC<{ result: SendResult }> = ({ result }) => (
  <div className="col-12">
    <div
      className={`alert ${result.success ? "alert-success" : "alert-danger"} d-flex align-items-start gap-2`}
    >
      {result.success ? (
        <CheckCircle size={20} className="mt-1" />
      ) : (
        <XCircle size={20} className="mt-1" />
      )}
      <div className="flex-grow-1">
        {result.message.split("\n").map((line, index) => (
          <div key={index}>
            <LinkifiedLine line={line} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SendResultAlert;
