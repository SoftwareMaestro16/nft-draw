import React, { useState } from 'react';
import './BrushSizeModal.css';

interface BrushSizeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onBrushSizeChange: (size: number) => void;
}

const BrushSizeModal: React.FC<BrushSizeModalProps> = ({ isVisible, onClose, onBrushSizeChange }) => {
    const [brushSize, setBrushSize] = useState<number>(5); // Default brush size

    const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const size = parseInt(e.target.value, 10);
      setBrushSize(size);
      onBrushSizeChange(size); // Передача нового размера кисти в родительский компонент
    };

    if (!isVisible) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Select Brush Size</h2>
          <input
            type="range"
            min="5"
            max="50"
            value={brushSize}
            onChange={handleBrushSizeChange}
          />
          <p>Brush Size: {brushSize}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
};

export default BrushSizeModal;
