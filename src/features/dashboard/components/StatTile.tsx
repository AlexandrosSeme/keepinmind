import React, { type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type StatTone =
  | "brand"
  | "dark"
  | "success"
  | "info"
  | "danger"
  | "neutral";

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** % change; colored green/red according to `higherIsBetter`. */
  delta?: number | null;
  deltaLabel?: string;
  higherIsBetter?: boolean;
  tone?: StatTone;
  onClick?: () => void;
}

const StatTile: React.FC<StatTileProps> = ({
  icon,
  label,
  value,
  hint,
  delta,
  deltaLabel,
  higherIsBetter = true,
  tone = "neutral",
  onClick,
}) => {
  const hasDelta = delta !== undefined && delta !== null;
  const good = hasDelta && (higherIsBetter ? delta >= 0 : delta <= 0);
  const content = (
    <>
      <div className="km-stat-tile__head">
        <span className="km-stat-tile__label">{label}</span>
        <span className={`km-stat-tile__icon km-stat-tile__icon--${tone}`}>
          {icon}
        </span>
      </div>
      <div className="km-stat-tile__value">{value}</div>
      <div className="km-stat-tile__foot">
        {hasDelta && (
          <span
            className={`km-stat-tile__delta ${good ? "is-good" : "is-bad"}`}
          >
            {delta >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(delta)}%
          </span>
        )}
        {(deltaLabel || hint) && (
          <span className="km-stat-tile__hint">
            {hasDelta ? deltaLabel : hint}
          </span>
        )}
      </div>
    </>
  );

  return onClick ? (
    <button
      type="button"
      className="km-stat-tile is-clickable"
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className="km-stat-tile">{content}</div>
  );
};

export default StatTile;
