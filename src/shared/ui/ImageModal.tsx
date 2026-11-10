import React from "react";
import Modal from "./Modal";
import "./ImageModal.scss";

interface ImageModalProps {
  title: string;
  src: string;
  alt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  title,
  src,
  alt = "",
  onClose,
}) => (
  <Modal
    title={title}
    onClose={onClose}
    size="lg"
    centered
    dark
    bodyClassName="p-0"
  >
    <img src={src} alt={alt} className="img-fluid w-100 km-image-modal__img" />
  </Modal>
);

export default ImageModal;
