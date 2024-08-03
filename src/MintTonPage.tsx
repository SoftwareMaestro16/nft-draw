import React, { useEffect, useRef, useState } from 'react';
import './MintTonPage.css';
import { BackButton } from './BackButton';
import { MainButton } from './MainButton';
import { useParams } from 'react-router-dom';
import { Address, beginCell, Cell, toNano } from "@ton/core";
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

interface FormData {
  name: string;
  description?: string;
}

interface Errors {
  name?: string;
  [key: string]: string | undefined;
}

const MintTonPage: React.FC = () => {
  const { friendlyAddress } = useParams<{ friendlyAddress: string }>();
  const [formData, setFormData] = useState<FormData>({
    name: '',
  });
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const [, setTxInProgress] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [resultUrl, setResultUrl] = useState<string>('');
  const [uploadMessageVisible, setUploadMessageVisible] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isEraserMode] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>('black'); // состояние для текущего цвета
  const [isBackgroundSet, setIsBackgroundSet] = useState(false);


  const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YzQ0MjFhMC1hMzJmLTQ1YzgtYTljOS0yYTRiZWI0MmJlYmYiLCJlbWFpbCI6ImRhbmlpbHNjaGVyYmFrb3YxMzM3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NGFhMTA1YjVmNjAyYWRiOTFmZiIsInNjb3BlZEtleVNlY3JldCI6ImI3MTA1YzJhOGI5MDM3MGFmY2U0M2M2MzU5Njc0YzcxMzc3ODZkNmM1ZDM1NDcyZjM1MWEzZDBlY2NlZDAxNjEiLCJleHAiOjE3NTQwNjkzMTB9.D5MN0ejg39UT4kEWP8H9h1CumqPnayqtHNr6bf48qE4";

  useEffect(() => {
    if (friendlyAddress) {
      console.log('Friendly Address:', friendlyAddress);
    }
  }, [friendlyAddress]);

  useEffect(() => {
    if (resultUrl) {
      setUploadMessageVisible(true);
      const timer = setTimeout(() => setUploadMessageVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [resultUrl]);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name as keyof FormData]: value
    }));
  };

  const validateForm = (): Errors => {
    const errors: Errors = {};
    if (!formData.name) errors.name = 'Name is required';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/jpeg');
    const response = await fetch(dataURL);
    const blob = await response.blob();
    const formDataImage = new FormData();
    formDataImage.append('file', blob, 'drawing.jpg');

    try {
      const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formDataImage,
      });

      const result = await uploadResponse.json();
      const ipfsHash = result.IpfsHash;
      const gatewayUrl = 'moccasin-recent-earthworm-890.mypinata.cloud';
      const imageUrl = `https://${gatewayUrl}/ipfs/${ipfsHash}`;

      const jsonData = {
        name: formData.name,
        image: imageUrl,
        description: formData.description,
        buttons: [
          {
            label: "Become an Artist 🎨",
            uri: "https://t.me/NFTDrawBot/Draw"
          }
        ],
        attributes: [
          {
            trait_type: "Art",
            value: "True"
          },
          {
            trait_type: "🎨",
            value: "🖌️"
          }
        ]
      };

      const jsonString = JSON.stringify(jsonData);

      const jsonResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT}`,
          'Content-Type': 'application/json'
        },
        body: jsonString
      });
      const jsonResult = await jsonResponse.json();
      const jsonIpfsHash = jsonResult.IpfsHash;
      const jsonGatewayUrl = 'moccasin-recent-earthworm-890.mypinata.cloud';
      setResultUrl(`https://${jsonGatewayUrl}/ipfs/${jsonIpfsHash}`);
      setUploadMessageVisible(true);
      setTimeout(() => setUploadMessageVisible(false), 2000);
    } catch (error) {
      console.error('Error uploading JSON:', error);
    }
  };


const startDrawing = (ctx: CanvasRenderingContext2D, event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = rect.left;
    const offsetY = rect.top;

    const isTouch = event.type.startsWith('touch');
    const clientX = isTouch ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = isTouch ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

    const x = clientX - offsetX;
    const y = clientY - offsetY;

    ctx.moveTo(x, y);
    ctx.beginPath();

    const draw = (moveEvent: MouseEvent | TouchEvent) => {
        const clientX = isTouch ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const clientY = isTouch ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;

        const x = clientX - offsetX;
        const y = clientY - offsetY;

        if (isEraserMode) {
            ctx.strokeStyle = 'white'; // Белый цвет для резинки
            ctx.lineWidth = 10; // Размер резинки
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.strokeStyle = currentColor; // Цвет кисти
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const endDrawing = () => {
        canvas.removeEventListener(isTouch ? 'touchmove' : 'mousemove', draw);
        canvas.removeEventListener(isTouch ? 'touchend' : 'mouseup', endDrawing);
    };

    canvas.addEventListener(isTouch ? 'touchmove' : 'mousemove', draw);
    canvas.addEventListener(isTouch ? 'touchend' : 'mouseup', endDrawing);
};

useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    if (!isBackgroundSet) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsBackgroundSet(true);
    }
  
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8.5; // Размер кисти
    ctx.strokeStyle = currentColor; // Начальный цвет кисти
  
    const start = (event: MouseEvent | TouchEvent) => {
        startDrawing(ctx, event);
        saveState();
    };
  
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('touchstart', start);
  
    return () => {
        canvas.removeEventListener('mousedown', start);
        canvas.removeEventListener('touchstart', start);
    };
}, [isEraserMode, currentColor, isBackgroundSet]);


  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prevHistory) => [...prevHistory, dataUrl]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setRedoStack(prevRedoStack => [canvas.toDataURL(), ...prevRedoStack]);
    const previousState = history[history.length - 1];
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory(prevHistory => prevHistory.slice(0, -1));
    };
};

const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStack[0];
    const img = new Image();
    img.src = nextState;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory(prevHistory => [...prevHistory, nextState]);
        setRedoStack(prevRedoStack => prevRedoStack.slice(1));
    };
};


  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };


    const onSendMintSbtSingle = async () => {
        if (!wallet) {
            console.error('Wallet is not connected');
            return;
        }

        if (!friendlyAddress) {
            console.error('Friendly address is not available');
            return;
        }

        setTxInProgress(true);

        try {
            const ownerAddress = Address.parse(friendlyAddress);
            const metaData = resultUrl;

            const payloadCell = beginCell()
            .storeUint(1, 32)
            .storeUint(123, 64)
            .storeCoins(toNano(0.05))
            .storeRef(beginCell()
                .storeAddress(ownerAddress)
                .storeRef(
                    beginCell().storeStringTail(metaData).endCell()
                )
                .storeAddress(ownerAddress)
                .endCell()
            )
            .endCell();

            const payload = payloadCell.toBoc().toString('base64');

            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: "EQBsrBcQEljeB4clOLGBHEM5UvzZZy6_Rv65obhkJV89NdA9",
                        amount: '55000000',
                        payload                 
                    },
                    {
                        address: "UQAI6XfeQmLtZ8qzeoNWJRYG8wfuWQZBZHZF5-eUH7kDiZVN",
                        amount: '100000000',                 
                    }
                ]
            };

            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });

            const imMsgCell = Cell.fromBase64(result.boc);
            console.log(imMsgCell);

            try {
                console.log(tx);
            } catch (e) {
                console.error('Error waiting for transaction:', e);
            }
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress(false);
        }
    };

    const isSubmitDisabled = !resultUrl;

    return (
        <div className="mint-ton-page">
            <BackButton />
            <h1>Mint SBT via TON</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className="label">Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                </div>
                <div>
                    <label className="label">Description (optional):</label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className={errors.description ? 'error' : ''}
                        style={{ height: '80px' }}
                    />
                    {errors.description && <p className="error-message">{errors.description}</p>}
                </div>
                <div>
                    <canvas id="canvas" ref={canvasRef} width="300" height="300" style={{ border: '2px solid black', cursor: 'crosshair', backgroundColor: 'white', display: 'block', margin: '0 auto' }}></canvas>
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
    <button type="button" onClick={undo} disabled={history.length === 0} style={{ margin: '5px' }}>←</button>
    <button type="button" onClick={redo} disabled={redoStack.length === 0} style={{ margin: '5px' }}>→</button>
    
    <div className="color-palette">
        <button type="button" style={{ backgroundColor: 'black' }} onClick={() => handleColorChange('black')}></button>
        <button type="button" style={{ backgroundColor: 'red' }} onClick={() => handleColorChange('red')}></button>
        <button type="button" style={{ backgroundColor: 'blue' }} onClick={() => handleColorChange('blue')}></button>
        <button type="button" style={{ backgroundColor: 'green' }} onClick={() => handleColorChange('green')}></button>
        <button type="button" style={{ backgroundColor: 'yellow' }} onClick={() => handleColorChange('yellow')}></button>
        <button type="button" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange('white')}></button> {/* Добавлено */}
    </div>
</div>
                <button
                    type="submit"
                    className="submit-button"
                >
                    {uploadMessageVisible ? 'Wait please 5 seconds...' : 'Send Data'}
                </button>
                <p>&nbsp;&nbsp;&nbsp;</p>
            </form>
            <MainButton
                text="Mint SBT 🎨"
                onClick={onSendMintSbtSingle}
                color="#7c64f5"
                textColor="#FFFFFF"
                disabled={isSubmitDisabled}
            />
            {resultUrl && (
                <div>
                    {uploadMessageVisible && resultUrl && <p className="upload">Successfully Uploaded!</p>}
                    <p>&nbsp;&nbsp;&nbsp;</p>
                </div>
            )}
        </div>
    );
};

export default MintTonPage;