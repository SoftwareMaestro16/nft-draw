import { useEffect, useState, FC } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import WebAppSDK from '@twa-dev/sdk';
import { THEME, TonConnectUIProvider, useTonConnectModal } from "@tonconnect/ui-react";
import { Header } from "./Header.tsx";
import './App.css';
import MintInftPage from "./MintInftPage.tsx";
import MintTonPage from "./MintTonPage.tsx";
import exampleImage from './assets/DrawImage.jpg'; 

declare global {
  interface Window {
    Telegram?: any;
  }
}

const Home: FC<{ setWalletAddress: (address: string | null) => void }> = ({ setWalletAddress }) => {
  const [walletAddress, setWalletAddressLocal] = useState<string | null>(null);
  const [friendlyAddress, setFriendlyAddress] = useState<string | null>(null);
  const { open } = useTonConnectModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress) {
      const friendly = walletAddress;
      setFriendlyAddress(friendly);
    } else {
      setFriendlyAddress(null);
    }
  }, [walletAddress]);

  useEffect(() => {
    setWalletAddress(walletAddress);
  }, [walletAddress, setWalletAddress]);

  const handleMintTonClick = () => {
    if (friendlyAddress) {
      navigate(`/mint-ton/${encodeURIComponent(friendlyAddress)}`);
    } else {
      open();
    }
  };

  const handleMintInftClick = () => {
    if (friendlyAddress) {
      navigate(`/mint-inft/${encodeURIComponent(friendlyAddress)}`);
    } else {
      open();
    }
  };

  return (
    <>
      <Header setWalletAddress={setWalletAddressLocal} />
      <div className="main-container">
        <h1 className='main-hh1'>NFT Draw</h1>
        <h2 className='main-h2'>Draw and Mint NFT</h2>
        <img src={exampleImage} alt="SBT Moments" className="example-image" />
      </div>
      <div className="button-container">
        <button className="button-1" onClick={handleMintTonClick}>Mint SBT via TON</button>
        <button className="button-2" onClick={handleMintInftClick}>Mint SBT via $INFT</button>
      </div>
    </>
  );
};

function App() {
  const [isTg, setIsTg] = useState<boolean>(false);

  useEffect(() => {
    const isTgCheck = window.Telegram?.WebApp?.initData !== '';

    if (isTgCheck) {
      WebAppSDK.ready();
      WebAppSDK.enableClosingConfirmation();
      WebAppSDK.expand();
      WebAppSDK.headerColor = "#b682ed";
      setIsTg(true);

      document.body.style.backgroundColor = 'var(--tg-theme-bg-color)';
      document.body.style.setProperty('background-color', 'var(--tg-theme-bg-color)', 'important');
    }
  }, []);

  return (
    <>
      {isTg ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'black',
          color: 'white',
          textAlign: 'center',
          fontSize: '24px',
        }}>
          Access denied. Please open in Telegram.
        </div>
      ) : (
        <TonConnectUIProvider
          manifestUrl="https://nft-draw-rho.vercel.app/tonconnect-manifest.json"
          uiPreferences={{
            borderRadius: 'm',
            colorsSet: {
                [THEME.DARK]: {
                    connectButton: {
                        background: '#7379da' 
                    },
                    accent: '#7379da', 
                    telegramButton: '#9571f0', 
                    background: {
                        qr: '#d7a1df',
                        tint: '#9c77f2', 
                        primary: '#c395e9',
                        secondary: '#8c77c0', 
                        segment: '#7379da' 
                    },
                    text: {
                        primary: '#000000',
                        secondary: '#000000' 
                    },
                }
            }
        }}
        
          actionsConfiguration={{
            modals: 'all',
            notifications: ['error'],
            twaReturnUrl: 'https://t.me/NFTDrawBot/Draw'
          }}
        >
          <Router>
            <Routes>
              <Route path="/" element={<Home setWalletAddress={() => { }} />} />
              <Route path="/mint-ton/:friendlyAddress" element={<MintTonPage />} />
              <Route path="/mint-inft/:friendlyAddress" element={<MintInftPage />} />
              {/* Add other routes here */}
            </Routes>
          </Router>
        </TonConnectUIProvider>
      )}
    </>
  );
}

export default App;
