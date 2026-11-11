import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "./Modal.scss";

export interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Wraps body + footer in a form so the footer can hold a submit button. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  /** Dark chrome used for camera / photo previews; stacks above regular modals. */
  dark?: boolean;
  closeOnBackdrop?: boolean;
  /** Blocks every close action, e.g. while saving. */
  closeDisabled?: boolean;
  bodyClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  footer,
  onSubmit,
  size,
  centered = false,
  dark = false,
  closeOnBackdrop = true,
  closeDisabled = false,
  bodyClassName = "",
}) => {
  const { t } = useTranslation();
  const handleClose = () => {
    if (!closeDisabled) onClose();
  };

  const dialogClass = [
    "modal-dialog",
    size ? `modal-${size}` : "",
    centered ? "modal-dialog-centered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className={`modal-body ${bodyClassName}`.trim()}>{children}</div>
      {footer && (
        <div
          className={`modal-footer ${dark ? "border-secondary" : ""}`.trim()}
        >
          {footer}
        </div>
      )}
    </>
  );

  return createPortal(
    <div
      className={`modal show d-block km-modal ${dark ? "km-modal--dark" : ""}`.trim()}
      role="dialog"
      aria-modal="true"
      onClick={closeOnBackdrop ? handleClose : undefined}
    >
      <div className={dialogClass} onClick={(e) => e.stopPropagation()}>
        <div
          className={`modal-content ${dark ? "bg-dark border-0" : ""}`.trim()}
        >
          <div
            className={`modal-header ${dark ? "border-secondary" : ""}`.trim()}
          >
            <h5 className={`modal-title ${dark ? "text-white" : ""}`.trim()}>
              {title}
            </h5>
            <button
              type="button"
              className={`btn-close ${dark ? "btn-close-white" : ""}`.trim()}
              aria-label={t("actions.close")}
              disabled={closeDisabled}
              onClick={handleClose}
            />
          </div>
          {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
