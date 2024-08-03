import React from 'react';
import { SketchPicker } from 'react-color';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onClose, onColorChange }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <SketchPicker
          color="#fff"
          onChangeComplete={(color) => onColorChange(color.hex)}
        />
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
