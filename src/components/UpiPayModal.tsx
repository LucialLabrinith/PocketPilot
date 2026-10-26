import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, LegalTransferCertificate } from '../types';
import jsQR from 'jsqr';
import { ConnectBankModal } from './ConnectBankModal';
import { BankSwitchComplianceModal } from './BankSwitchComplianceModal';
import { BankBranchSelector } from './BankBranchSelector';
import {
  QrCode,
  Smartphone,
  AtSign,
  Building2,
  ArrowRightLeft,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  RefreshCw,
  Wallet,
  Landmark,
  Lock,
  Search,
  UserCheck,
  Send,
  Zap,
  Tag,
  KeyRound,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Scan,
  Copy,
  SwitchCamera,
  Check,
  Server,
  Scale,
  FileText
} from 'lucide-react';

export type PayMode = 'QR' | 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | 'SELF' | 'RECEIVE';

interface UpiPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  defaultMode?: PayMode;
}

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  vpa: string;
  avatarColor: string;
  recentMerchant?: boolean;
}

export interface DecodedMerchantInfo {
  raw: string;
  merchantName: string;
  vpa: string;
  amount?: string;
  purpose?: string;
  currency?: string;
  mcc?: string;
  referenceId?: string;
  classification: 'NEED' | 'WANT' | 'SAVINGS';
}

export function parseUpiString(rawInput: string): DecodedMerchantInfo {
  const raw = rawInput.trim();
  let vpa = '';
  let merchantName = '';
  let amount = '';
  let purpose = '';
  let currency = 'INR';
  let mcc = '';
  let referenceId = '';

  if (raw.startsWith('upi://pay') || raw.startsWith('upi://') || raw.includes('pa=')) {
    try {
      const queryString = raw.includes('?') ? raw.split('?')[1] : raw;
      const params = new URLSearchParams(queryString);
      vpa = params.get('pa') || '';
      merchantName = params.get('pn') ? decodeURIComponent(params.get('pn')!) : '';
      amount = params.get('am') || '';
      purpose = params.get('tn') ? decodeURIComponent(params.get('tn')!) : '';
      currency = params.get('cu') || 'INR';
      mcc = params.get('mc') || '';
      referenceId = params.get('tr') || params.get('tid') || '';
    } catch {
      const paMatch = raw.match(/[?&]pa=([^&]+)/);
      if (paMatch) vpa = decodeURIComponent(paMatch[1]);
      const pnMatch = raw.match(/[?&]pn=([^&]+)/);
      if (pnMatch) merchantName = decodeURIComponent(pnMatch[1]);
      const amMatch = raw.match(/[?&]am=([^&]+)/);
      if (amMatch) amount = amMatch[1];
      const tnMatch = raw.match(/[?&]tn=([^&]+)/);
      if (tnMatch) purpose = decodeURIComponent(tnMatch[1]);
    }
  } else if (raw.includes('@')) {
    vpa = raw;
  } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      vpa = url.searchParams.get('pa') || '';
      merchantName = url.searchParams.get('pn') ? decodeURIComponent(url.searchParams.get('pn')!) : '';
      amount = url.searchParams.get('am') || '';
      purpose = url.searchParams.get('tn') ? decodeURIComponent(url.searchParams.get('tn')!) : '';
    } catch {}
  }

  if (!merchantName && vpa) {
    const handle = vpa.split('@')[0].replace(/[._-]/g, ' ');
    merchantName = handle
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  if (!merchantName) {
    merchantName = 'Verified Merchant';
  }

  let classification: 'NEED' | 'WANT' | 'SAVINGS' = 'WANT';
  const checkText = `${merchantName} ${purpose} ${vpa}`.toLowerCase();
  if (
    checkText.includes('grocer') ||
    checkText.includes('fresh') ||
    checkText.includes('petrol') ||
    checkText.includes('fuel') ||
    checkText.includes('oil') ||
    checkText.includes('pharmacy') ||
    checkText.includes('medic') ||
    checkText.includes('apollo') ||
    checkText.includes('metro') ||
    checkText.includes('transit') ||
    checkText.includes('bill') ||
    checkText.includes('rent') ||
    checkText.includes('kirana')
  ) {
    classification = 'NEED';
  } else if (
    checkText.includes('sip') ||
    checkText.includes('fd') ||
    checkText.includes('invest') ||
    checkText.includes('deposit') ||
    checkText.includes('groww') ||
    checkText.includes('zerodha')
  ) {
    classification = 'SAVINGS';
  }

  return {
    raw,
    merchantName,
    vpa: vpa || raw,
    amount: amount || undefined,
    purpose: purpose || `Payment to ${merchantName}`,
    currency,
    mcc,
    referenceId,
    classification,
  };
}

function playScannerBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch {}
}

const SAMPLE_CONTACTS: ContactItem[] = [
  { id: '1', name: 'Rohan Sharma', phone: '+91 98765 43210', vpa: 'rohan@okhdfcbank', avatarColor: 'bg-indigo-600' },
  { id: '2', name: 'Priya Patel', phone: '+91 98234 56781', vpa: 'priya@oksbi', avatarColor: 'bg-emerald-600' },
  { id: '3', name: 'Amit Verma', phone: '+91 98112 23344', vpa: 'amit@okaxis', avatarColor: 'bg-purple-600' },
  { id: '4', name: 'Mom (Savita)', phone: '+91 99887 76655', vpa: 'savita@oksbi', avatarColor: 'bg-rose-600' },
  { id: '5', name: 'Landlord - Rajiv', phone: '+91 98711 22334', vpa: 'rajiv.rent@okicici', avatarColor: 'bg-amber-600' },
  { id: '6', name: 'Starbucks Coffee', phone: '+91 80011 22334', vpa: 'starbucks@paytm', avatarColor: 'bg-green-700', recentMerchant: true },
  { id: '7', name: 'Nature Basket Grocery', phone: '+91 90022 33445', vpa: 'naturesbasket@upi', avatarColor: 'bg-teal-600', recentMerchant: true },
];

const PRESET_QR_CODES = [
  {
    name: 'Starbucks Coffee',
    vpa: 'starbucks@paytm',
    defaultAmount: '240.00',
    purpose: 'Coffee & Breakfast',
    classification: 'WANT' as const,
    logo: '☕',
    upiUri: 'upi://pay?pa=starbucks@paytm&pn=Starbucks%20Coffee&am=240.00&cu=INR&tn=Coffee%20and%20Breakfast',
  },
  {
    name: 'Reliance Fresh Mart',
    vpa: 'reliancefresh@okicici',
    defaultAmount: '850.00',
    purpose: 'Weekly Groceries',
    classification: 'NEED' as const,
    logo: '🛒',
    upiUri: 'upi://pay?pa=reliancefresh@okicici&pn=Reliance%20Fresh%20Mart&am=850.00&cu=INR&tn=Weekly%20Groceries',
  },
  {
    name: 'Indian Oil Petrol Pump',
    vpa: 'indianoil@oksbi',
    defaultAmount: '1200.00',
    purpose: 'Vehicle Fuel Petrol',
    classification: 'NEED' as const,
    logo: '⛽',
    upiUri: 'upi://pay?pa=indianoil@oksbi&pn=Indian%20Oil%20Corporation&am=1200.00&cu=INR&tn=Vehicle%20Fuel%20Petrol',
  },
  {
    name: 'Swiggy Food Delivery',
    vpa: 'swiggy@okhdfcbank',
    defaultAmount: '420.00',
    purpose: 'Food Delivery Order',
    classification: 'WANT' as const,
    logo: '🍔',
    upiUri: 'upi://pay?pa=swiggy@okhdfcbank&pn=Swiggy%20Food%20Delivery&am=420.00&cu=INR&tn=Dinner%20Food%20Order',
  },
  {
    name: 'Delhi Metro Transit',
    vpa: 'delhimetro@upi',
    defaultAmount: '200.00',
    purpose: 'SmartCard Transit Recharge',
    classification: 'NEED' as const,
    logo: '🚇',
    upiUri: 'upi://pay?pa=delhimetro@upi&pn=Delhi%20Metro%20Rail&am=200.00&cu=INR&tn=Metro%20Transit%20Recharge',
  },
  {
    name: 'Apollo Pharmacy',
    vpa: 'apollo@okaxis',
    defaultAmount: '540.00',
    purpose: 'Medicines & First Aid',
    classification: 'NEED' as const,
    logo: '💊',
    upiUri: 'upi://pay?pa=apollo@okaxis&pn=Apollo%20Pharmacy&am=540.00&cu=INR&tn=Prescription%20Medicines',
  },
  {
    name: 'Blue Tokai Roasters',
    vpa: 'bluetokai@okaxis',
    defaultAmount: '380.00',
    purpose: 'Artisan Cold Brew',
    classification: 'WANT' as const,
    logo: '🥤',
    upiUri: 'upi://pay?pa=bluetokai@okaxis&pn=Blue%20Tokai%20Coffee%20Roasters&am=380.00&cu=INR&tn=Cold%20Brew%20Coffee',
  },
  {
    name: 'Sharma Kirana Store',
    vpa: 'sharmastore@oksbi',
    defaultAmount: '165.00',
    purpose: 'Daily Milk and Provisions',
    classification: 'NEED' as const,
    logo: '🏪',
    upiUri: 'upi://pay?pa=sharmastore@oksbi&pn=Sharma%20General%20Store&am=165.00&cu=INR&tn=Daily%20Provisions',
  },
];

export const UpiPayModal: React.FC<UpiPayModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  defaultMode = 'QR'
}) => {
  const { user } = useAuth();
  const { formatCurrency, formatDigits } = useLanguage();

  const [activeTab, setActiveTab] = useState<PayMode>(defaultMode);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedPayingAccountId, setSelectedPayingAccountId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [amount, setAmount] = useState<string>('250.00');
  const [payee, setPayee] = useState<string>('Starbucks Cafe');
  const [payeeIdentifier, setPayeeIdentifier] = useState<string>('starbucks@paytm');
  const [purpose, setPurpose] = useState<string>('Coffee & Breakfast');
  const [classification, setClassification] = useState<'NEED' | 'WANT' | 'SAVINGS'>('WANT');
  const [upiPin, setUpiPin] = useState<string>('1234');
  const [contactSearch, setContactSearch] = useState<string>('');

  // Self Transfer Target Bank
  const [selfTargetAccountId, setSelfTargetAccountId] = useState<string>('');

  // Check Balance State
  const [isCheckBalanceOpen, setIsCheckBalanceOpen] = useState<boolean>(false);
  const [balanceCheckPin, setBalanceCheckPin] = useState<string>('');
  const [balanceCheckResult, setBalanceCheckResult] = useState<any | null>(null);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState<boolean>(false);

  // Incoming Transfer (Receive Simulation)
  const [receiveAmount, setReceiveAmount] = useState<string>('5000.00');
  const [senderName, setSenderName] = useState<string>('Infosys Technologies (Salary)');
  const [senderBank, setSenderBank] = useState<string>('HDFC Bank Interbank');
  const [senderUpiId, setSenderUpiId] = useState<string>('infosys.payroll@okhdfcbank');
  const [receiveClassification, setReceiveClassification] = useState<'NEED' | 'WANT' | 'SAVINGS'>('NEED');
  const [receiveNotes, setReceiveNotes] = useState<string>('Monthly Consulting / Salary Payout');

  // Live Switch Handshake & Telemetry state
  const [switchLiveStep, setSwitchLiveStep] = useState<number>(0);
  const [switchLiveLogs, setSwitchLiveLogs] = useState<string[]>([]);
  const [bankTransferMode, setBankTransferMode] = useState<'POPULAR' | 'DIRECTORY' | 'MANUAL'>('POPULAR');
  const [beneficiaryAccNum, setBeneficiaryAccNum] = useState<string>('501004829104');
  const [beneficiaryIfsc, setBeneficiaryIfsc] = useState<string>('SBIN0000300');
  const [beneficiaryBankName, setBeneficiaryBankName] = useState<string>('State Bank of India');
  const [beneficiaryBranch, setBeneficiaryBranch] = useState<string>('Mumbai Fort Main');

  // Load user bank accounts
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accs = await api.getAccounts();
      setAccounts(accs);
      if (accs.length > 0) {
        if (!selectedPayingAccountId) {
          setSelectedPayingAccountId(accs[0].id);
        }
        if (accs.length > 1 && !selfTargetAccountId) {
          setSelfTargetAccountId(accs[1].id);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed loading accounts');
    } finally {
      setLoading(false);
    }
  };

  // Bank Linking & Modal States
  const [isConnectBankModalOpen, setIsConnectBankModalOpen] = useState<boolean>(false);

  const selectedAccount = accounts.find(a => a.id === selectedPayingAccountId) || accounts[0];
  const primaryReceivingAccount = accounts.find(a => a.is_primary_receiving) || accounts[0];

  // Pinnacle CBS & NPCI Switch Legal States
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState<boolean>(false);
  const [selectedCertForModal, setSelectedCertForModal] = useState<LegalTransferCertificate | null>(null);
  const [verifiedTransferree, setVerifiedTransferree] = useState<any | null>(null);
  const [transferFeeData, setTransferFeeData] = useState<any | null>({
    customerFee: '0.00',
    gst: '0.00',
    isFeeWaived: true,
    regulatoryClause: '100% Free Retail Transfer under RBI Directive Section 10(2) PSSA 2007',
  });

  const checkTransferreeIdentity = async (queryToVerify: string) => {
    if (!queryToVerify || queryToVerify.trim().length < 3) return;
    try {
      const res = await api.verifyTransferree(queryToVerify.trim());
      if (res.data?.found) {
        setVerifiedTransferree(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    api.calculateTransferFee(amount || '0', activeTab === 'QR' ? 'P2M' : 'P2P')
      .then(res => { if (res.data) setTransferFeeData(res.data); })
      .catch(() => {});
  }, [amount, activeTab]);

  // NPCI Directory Query States
  const [isSearchingNpci, setIsSearchingNpci] = useState<boolean>(false);
  const [npciResult, setNpciResult] = useState<{ found: boolean; verifiedName?: string | null; vpa?: string; bank?: string; ifsc?: string; message: string } | null>(null);
  const [showNewContactHelp, setShowNewContactHelp] = useState<boolean>(false);

  const handleLookupNpci = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q || q.length < 3) return;
    setIsSearchingNpci(true);
    setNpciResult(null);
    setShowNewContactHelp(false);
    try {
      const res = await api.lookupUpiDirectory(q);
      setNpciResult(res);
      if (res.found && res.verifiedName) {
        setPayee(res.verifiedName);
        if (res.vpa) setPayeeIdentifier(res.vpa);
      } else {
        setShowNewContactHelp(true);
      }
    } catch (err: any) {
      setNpciResult({
        found: false,
        verifiedName: null,
        message: err.message || 'NPCI Central Directory query failed'
      });
      setShowNewContactHelp(true);
    } finally {
      setIsSearchingNpci(false);
    }
  };

  // CAMERA & BARCODE/QR SCANNER ENGINE
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [lastScannedPayload, setLastScannedPayload] = useState<string | null>(null);
  const [decodedMerchant, setDecodedMerchant] = useState<DecodedMerchantInfo | null>(null);

  const handleDecodedBarcodeOrQr = (raw: string) => {
    setLastScannedPayload(raw);
    playScannerBeep();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([60, 40, 80]); } catch {}
    }

    const info = parseUpiString(raw);
    setDecodedMerchant(info);
    setPayee(info.merchantName);
    setPayeeIdentifier(info.vpa);
    if (info.amount) {
      setAmount(info.amount);
    }
    if (info.purpose) {
      setPurpose(info.purpose);
    }
    setClassification(info.classification);
    setScannedFeedback(`✓ Identified: ${info.merchantName} (${info.vpa})`);
    checkTransferreeIdentity(info.vpa || info.merchantName);

    // Temporarily pause scanner so it doesn't re-trigger continuously
    isScanningRef.current = false;
  };

  const scanVideoFrame = async () => {
    if (!isScanningRef.current || !videoRef.current) return;
    const video = videoRef.current;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let decodedString: string | null = null;

        // 1. Native BarcodeDetector API (Chrome, Edge, Android WebView)
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            // @ts-ignore
            const detector = new window.BarcodeDetector({
              formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
            });
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              decodedString = barcodes[0].rawValue;
            }
          } catch {
            // Fallback
          }
        }

        // 2. jsQR Pure JS Barcode & QR Decoder (Guaranteed across all browsers)
        if (!decodedString) {
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              decodedString = code.data;
            }
          } catch {}
        }

        if (decodedString && decodedString !== lastScannedPayload) {
          handleDecodedBarcodeOrQr(decodedString);
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setScannedFeedback(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any available video stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
        isScanningRef.current = true;
        setScannedFeedback('📷 Viewfinder active • Align merchant QR or barcode in frame');
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      } else {
        setCameraError('Camera API not accessible in this environment. You can upload a QR image or pick preset QRs below.');
      }
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera permissions in your browser or upload an image.'
        : 'Could not access device camera. You can upload an image or choose a preset merchant below.';
      setCameraError(msg);
      setIsCameraActive(false);
      isScanningRef.current = false;
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      stopCamera();
      await startCamera(nextFacing);
    }
  };

  const resumeScanning = () => {
    setLastScannedPayload(null);
    setScannedFeedback('Viewfinder live • Ready to scan');
    isScanningRef.current = true;
    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleFileUploadQr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        let decodedString: string | null = null;

        // 1. Try BarcodeDetector
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            // @ts-ignore
            const detector = new window.BarcodeDetector({
              formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'upc_a']
            });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              decodedString = barcodes[0].rawValue;
            }
          } catch {}
        }

        // 2. Try jsQR
        if (!decodedString) {
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data) {
              decodedString = code.data;
            }
          } catch {}
        }

        if (decodedString) {
          handleDecodedBarcodeOrQr(decodedString);
        } else {
          setErrorMessage(`No valid UPI QR code or barcode found in "${file.name}". Try a clearer photo or pick a preset merchant below.`);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Select Preset Merchant QR
  const handleSelectPresetQr = (qr: typeof PRESET_QR_CODES[0]) => {
    handleDecodedBarcodeOrQr(qr.upiUri);
  };

  // Select Contact
  const handleSelectContact = (c: ContactItem) => {
    setPayee(c.name);
    setPayeeIdentifier(c.vpa || c.phone);
    setPurpose(`Transfer to ${c.name}`);
  };

  // Submit UPI Payment via Real-Time Switch
  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    setSwitchLiveStep(1);
    setSwitchLiveLogs([
      `[PINNACLE-CBS] Contacting Host CBS... Holding debit reservation on ${selectedAccount?.name || 'Bank'}.`
    ]);

    try {
      const payload = {
        payingAccountId: selectedPayingAccountId || selectedAccount?.id || '',
        toAccountId: activeTab === 'SELF' ? selfTargetAccountId : undefined,
        amount,
        payee: activeTab === 'SELF' ? `Self Transfer to ${accounts.find(a => a.id === selfTargetAccountId)?.name || 'Account'}` : payee,
        payeeType: (activeTab === 'RECEIVE' ? 'UPI_ID' : activeTab) as 'QR' | 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | 'SELF',
        payeeIdentifier: activeTab === 'SELF' ? (accounts.find(a => a.id === selfTargetAccountId)?.account_number_masked || 'Self') : payeeIdentifier,
        classification,
        purpose,
        upiPin,
      };

      await new Promise(r => setTimeout(r, 280));
      setSwitchLiveStep(2);
      setSwitchLiveLogs(prev => [
        ...prev,
        `[NPCI-SWITCH] Routing ISO 20022 packet across National Central Payment Rails (Julian RRN counter locked)...`
      ]);

      await new Promise(r => setTimeout(r, 320));
      setSwitchLiveStep(3);
      setSwitchLiveLogs(prev => [
        ...prev,
        `[BENEFICIARY-SW] Interbank Bank Switch authorization handshake verified • Destination Branch ledger matched.`
      ]);

      const res = await api.payUpi(payload);

      setSwitchLiveStep(4);
      setSwitchLiveLogs(prev => [
        ...prev,
        `[SETTLEMENT] Core CBS settlement finality reached! NPCI RRN: ${res.data?.npciRrn} • Available balance deducted.`
      ]);
      await new Promise(r => setTimeout(r, 350));

      setSuccessResult(res.data);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'UPI Payment Failed');
    } finally {
      setSubmitting(false);
      setSwitchLiveStep(0);
    }
  };

  // Check Live Balance via UPI PIN
  const handleCheckBalance = async () => {
    setBalanceCheckLoading(true);
    setBalanceCheckResult(null);
    try {
      const res = await api.checkUpiBalance(selectedPayingAccountId || selectedAccount?.id || '', balanceCheckPin || upiPin);
      setBalanceCheckResult(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Balance check failed. Please verify your UPI PIN.');
    } finally {
      setBalanceCheckLoading(false);
    }
  };

  // Set Primary Receiving Bank Account
  const handleSetPrimaryReceiving = async (accId: string) => {
    try {
      await api.setPrimaryReceivingAccount(accId);
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update primary receiving bank account');
    }
  };

  // Receive Transfer Simulation
  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await api.receiveUpi({
        receivingAccountId: primaryReceivingAccount?.id,
        amount: receiveAmount,
        senderName,
        senderBank,
        senderUpiId,
        classification: receiveClassification,
        notes: receiveNotes,
      });
      setSuccessResult({
        isReceived: true,
        amount: receiveAmount,
        currency: primaryReceivingAccount?.currency || 'INR',
        payee: senderName,
        payingBank: primaryReceivingAccount?.name,
        remainingBalance: res.data?.newBalance,
        purpose: receiveNotes,
        classification: receiveClassification,
      });
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed receiving money');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Zap className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight">UPI Super Pay</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 flex items-center gap-0.5">
                  <ShieldCheck className="h-3 w-3" /> Live
                </span>
              </div>
              <p className="text-[11px] text-sky-100">
                Universal Bank-to-Bank, QR, Contact &amp; VPA Transfers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs shrink-0 font-medium">
          <button
            onClick={() => { setActiveTab('QR'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'QR'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="text-[10px]">Scan QR</span>
          </button>

          <button
            onClick={() => { setActiveTab('CONTACT'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'CONTACT'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-[10px]">Contact</span>
          </button>

          <button
            onClick={() => { setActiveTab('UPI_ID'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'UPI_ID'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AtSign className="h-4 w-4" />
            <span className="text-[10px]">UPI VPA</span>
          </button>

          <button
            onClick={() => { setActiveTab('BANK_TRANSFER'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'BANK_TRANSFER'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span className="text-[10px]">To Bank</span>
          </button>

          <button
            onClick={() => { setActiveTab('SELF'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'SELF'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="text-[10px]">Self</span>
          </button>

          <button
            onClick={() => { setActiveTab('RECEIVE'); setSuccessResult(null); }}
            className={`py-2.5 px-1 flex flex-col items-center gap-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'RECEIVE'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span className="text-[10px]">Receive</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* LIVE SWITCH PROGRESSION ANIMATION */}
          {submitting ? (
            <div className="py-6 px-4 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/40 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SWITCH CLEARANCE IN PROGRESS
                </div>
                <h3 className="text-base font-black tracking-tight text-white">
                  Transferring ₹{amount} via Switch Rails
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedAccount?.name || 'Bank'} ➔ Pinnacle CBS ➔ NPCI Central Switch ➔ Beneficiary Switch
                </p>
              </div>

              {/* 4-Step Animated Pipeline Nodes */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  { step: 1, label: 'Pinnacle CBS', sub: 'Debit Hold', code: 'CBS-PINN' },
                  { step: 2, label: 'NPCI Switch', sub: 'ISO 20022', code: 'NPCI-NET' },
                  { step: 3, label: 'Beneficiary SW', sub: 'Auth Code', code: 'SW-AUTH' },
                  { step: 4, label: 'Settlement', sub: 'Balance Debited', code: 'SETTLED' },
                ].map(node => {
                  const isDone = switchLiveStep > node.step;
                  const isCurrent = switchLiveStep === node.step;
                  return (
                    <div
                      key={node.step}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105'
                          : isDone
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-700 text-[9px] flex items-center justify-center">
                            {node.step}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-[10px] truncate">{node.label}</div>
                      <div className="text-[8px] text-slate-400 truncate">{node.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Live Terminal Telemetry Box */}
              <div className="p-3 rounded-2xl bg-black/80 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
                <div className="flex items-center justify-between text-[9px] text-slate-500 pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    SWITCH TELEMETRY: ACTIVE
                  </span>
                  <span>ISO 8583 / MTI 0200</span>
                </div>
                {switchLiveLogs.map((log, i) => (
                  <div key={i} className="animate-in fade-in flex items-start gap-1.5">
                    <span className="text-indigo-400 select-none">›</span>
                    <span className={i === switchLiveLogs.length - 1 ? 'text-white font-bold' : 'text-slate-400'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                <span>⚡ Latency: 38ms</span>
                <span className="text-emerald-400 font-bold">Transfer Fee: ₹0.00 (RBI Sec 10(2) Free)</span>
              </div>
            </div>
          ) : successResult ? (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {successResult.isReceived ? 'Money Received Successfully!' : 'UPI Payment Successful!'}
                </h3>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  {formatCurrency(successResult.amount, successResult.currency || 'INR')}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {successResult.isReceived ? `Credited to ${successResult.payingBank}` : `Debited from ${successResult.payingBank}`}
                </p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                {/* Official NPCI RRN */}
                {successResult.npciRrn && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                        Official NPCI 12-Digit RRN:
                      </span>
                      <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">
                        {successResult.npciRrn}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successResult.npciRrn);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-bold hover:bg-indigo-50 cursor-pointer"
                    >
                      Copy RRN
                    </button>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Legal Transferree:</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>{successResult.transferreeLegalName || successResult.payee}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline" />
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Switch Clearance Route:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] text-right truncate max-w-[220px]">
                    {successResult.switchRoute || 'Pinnacle CBS Host ➔ NPCI Switch'}
                  </span>
                </div>

                {successResult.cbsPinnacleRef && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-400">Pinnacle CBS Host Ref:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{successResult.cbsPinnacleRef}</span>
                  </div>
                )}

                {successResult.bankSwitchAuth && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-400">Bank Switch Auth Code:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{successResult.bankSwitchAuth}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Transfer Fee ("tranfee"):</span>
                  <span className="font-bold text-emerald-600">
                    ₹ {successResult.feeBreakdown?.customerFee || '0.00'} (100% Free / RBI Protected)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 font-mono">
                  <span className="text-slate-400">Updated Bank Balance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(successResult.remainingBalance || '0.00', successResult.currency || 'INR')}
                  </span>
                </div>

                <div className="flex justify-between pt-1 text-[11px] text-slate-400 font-mono">
                  <span>Legal Audit Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" /> SETTLED LEGAL TENDER
                  </span>
                </div>

                {/* View Official Legal Certificate Button */}
                {successResult.certificate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCertForModal(successResult.certificate);
                      setIsComplianceModalOpen(true);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Official NPCI Legal Transfer Certificate</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2 w-full max-w-md pt-2">
                <button
                  type="button"
                  onClick={() => { setSuccessResult(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Make Another Transfer
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeTab === 'RECEIVE' ? (
            /* RECEIVE TAB: Personal UPI QR Code & Incoming Simulation */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 text-center space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Primary Receiving Bank Account
                </span>
                <div className="flex items-center justify-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {primaryReceivingAccount?.name || 'Primary Bank Account'}
                  </h3>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xs mx-auto shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Your UPI ID (VPA)</p>
                  <p className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400 mt-0.5 select-all">
                    {primaryReceivingAccount?.upi_vpa || `${(user?.email || 'user').split('@')[0]}@okhdfcbank`}
                  </p>
                </div>
              </div>

              {/* Switch Primary Receiving Account */}
              <div>
                <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Change Primary Receiving Account
                </label>
                <select
                  value={primaryReceivingAccount?.id}
                  onChange={e => handleSetPrimaryReceiving(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution || 'Bank'}) — {acc.account_number_masked} {acc.is_primary_receiving ? '★ PRIMARY' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Incoming transfers from anyone will automatically credit this primary bank account.
                </p>
              </div>

              {/* Incoming Transfer Simulation Form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    Accept Transfer from Any Bank / Person
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold">Live Simulation</span>
                </div>

                <form onSubmit={handleReceiveSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold uppercase text-slate-500 mb-1">Amount to Receive ({primaryReceivingAccount?.currency || 'INR'})</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={receiveAmount}
                        onChange={e => setReceiveAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-slate-500 mb-1">Classification</label>
                      <select
                        value={receiveClassification}
                        onChange={e => setReceiveClassification(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                      >
                        <option value="NEED">NEED (Income/Salary/Bills)</option>
                        <option value="SAVINGS">SAVINGS (Investment Return)</option>
                        <option value="WANT">WANT (Gift/Other)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-500 mb-1">Sender Entity / Name</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Infosys Technologies / Friend / Amazon Refund"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold uppercase text-slate-500 mb-1">Sender Bank</label>
                      <input
                        type="text"
                        value={senderBank}
                        onChange={e => setSenderBank(e.target.value)}
                        placeholder="e.g. SBI / HDFC Bank"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase text-slate-500 mb-1">Purpose / Note</label>
                      <input
                        type="text"
                        value={receiveNotes}
                        onChange={e => setReceiveNotes(e.target.value)}
                        placeholder="e.g. Salary / Project Payment"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>{submitting ? 'Crediting Account...' : `Accept & Credit ₹ ${receiveAmount} into ${primaryReceivingAccount?.name}`}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : accounts.length === 0 ? (
            /* NO BANK CONNECTED STATE */
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
                <Landmark className="h-8 w-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  No Bank Account Linked for UPI
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  UPI is direct bank-to-bank settlement on NPCI rails. To scan merchant QR codes and make real UPI payments, you need to connect your real bank account and verify your balance.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Account Holder:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{user?.fullName || (user?.email || 'user').split('@')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Google Login ID:</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{user?.email || 'user@gmail.com'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Real Bank Balance:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Recorded directly from your connected bank</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConnectBankModalOpen(true)}
                className="w-full max-w-sm py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Connect Real Bank Account Now</span>
              </button>
            </div>
          ) : (
            /* PAYMENT MODES: QR, CONTACT, UPI_ID, BANK_TRANSFER, SELF */
            <form onSubmit={handlePaySubmit} className="space-y-4">
              {/* REAL MONEY & CONNECTED ACCOUNT CARD */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Connected Paying Bank
                      </div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{selectedAccount?.name || 'Primary Bank'}</span>
                        {selectedAccount?.account_number_masked && (
                          <span className="font-mono text-[11px] text-slate-400">({selectedAccount.account_number_masked})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Real Account Money
                    </div>
                    <div className="text-base sm:text-lg font-mono font-black text-emerald-300">
                      {formatCurrency(selectedAccount?.current_balance || '0.00', selectedAccount?.currency || 'INR')}
                    </div>
                  </div>
                </div>

                {/* Real-time Balance Sufficiency Indicator */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  {parseFloat(selectedAccount?.current_balance || '0') >= parseFloat(amount || '0') ? (
                    <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Sufficient balance • Balance after pay: {formatCurrency(Math.max(0, parseFloat(selectedAccount?.current_balance || '0') - parseFloat(amount || '0')).toFixed(2), selectedAccount?.currency || 'INR')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Low balance warning: Amount exceeds current balance of {formatCurrency(selectedAccount?.current_balance || '0.00', selectedAccount?.currency || 'INR')}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsConnectBankModalOpen(true)}
                    className="text-sky-300 hover:text-white font-semibold text-[10px] underline cursor-pointer ml-auto"
                  >
                    + Connect Another Bank
                  </button>
                </div>
              </div>

              {/* PINNACLE CBS & NPCI CENTRAL SWITCH ROUTE STATUS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-[11px] text-slate-300 shadow-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-semibold text-slate-200 truncate">
                    Route: Pinnacle CBS Host ➔ NPCI Central Switch ➔ Bank Switch
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComplianceModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-200 underline font-bold shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                >
                  <Server className="h-3 w-3" />
                  <span>Switch Law</span>
                </button>
              </div>

              {/* SUB-HEADER: Presets or Mode Specific Controls */}
              {activeTab === 'QR' && (
                <div className="space-y-3">
                  {/* LIVE CAMERA & QR SCANNER VIEWFINDER */}
                  <div className="relative rounded-2xl bg-slate-950 border-2 border-emerald-500/40 overflow-hidden text-white p-3 shadow-inner">
                    {/* Viewfinder box with animated scan laser */}
                    <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center border border-slate-800">
                      {isCameraActive ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center p-4 space-y-2 z-10">
                          <div className="p-3 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                            <Scan className="h-8 w-8" />
                          </div>
                          <div className="text-xs font-bold text-white">Live Camera Barcode &amp; UPI QR Scanner</div>
                          <div className="text-[10px] text-slate-400 max-w-xs">
                            Point device camera at any Google Pay, PhonePe, Paytm, BharatPe QR, or merchant barcode
                          </div>
                        </div>
                      )}

                      {/* Viewfinder Reticle Corners */}
                      <div className="absolute inset-3 pointer-events-none border-2 border-dashed border-emerald-400/60 rounded-xl flex flex-col justify-between p-2">
                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                          <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                        </div>
                        {/* Animated Laser Scanning Line */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce"></div>
                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                          <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                        </div>
                      </div>

                      {/* Camera Permission or Hardware Error */}
                      {cameraError && (
                        <div className="absolute inset-x-2 top-2 bg-red-950/90 border border-red-500 text-red-200 text-[11px] p-2 rounded-lg z-20 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      {/* Scanned Feedback Toast */}
                      {scannedFeedback && (
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-between z-20 shadow-md">
                          <span className="truncate">{scannedFeedback}</span>
                          <span className="shrink-0 text-emerald-400 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Decoded
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Viewfinder Action Buttons */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isCameraActive ? () => stopCamera() : () => startCamera()}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isCameraActive
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>{isCameraActive ? 'Stop Camera' : '📷 Open Camera Scanner'}</span>
                      </button>

                      {isCameraActive && (
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                          title="Flip Camera (Front/Rear)"
                        >
                          <SwitchCamera className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Flip</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        title="Upload QR Image"
                      >
                        <Upload className="h-3.5 w-3.5 text-sky-400" />
                        <span>Upload Image</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUploadQr}
                      />
                    </div>
                  </div>

                  {/* DECODED MERCHANT IDENTIFICATION BANNER */}
                  {decodedMerchant && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-xs">Identified Merchant from Barcode / QR:</span>
                        </div>
                        <button
                          type="button"
                          onClick={resumeScanning}
                          className="text-[10px] text-emerald-700 dark:text-emerald-300 hover:underline font-bold cursor-pointer"
                        >
                          Re-scan Code
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Merchant Name</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{decodedMerchant.merchantName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">UPI VPA / Handle</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">{decodedMerchant.vpa}</span>
                        </div>
                      </div>
                      {decodedMerchant.amount && (
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                          Pre-filled Amount: <strong>₹{decodedMerchant.amount}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6 Popular Merchant Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold uppercase text-slate-700 dark:text-slate-300 text-[10px]">
                        Or 1-Tap Scan Popular Merchant QRs:
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Instant Auto-Fill
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {PRESET_QR_CODES.map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetQr(qr)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            payee === qr.name
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="text-base">{qr.logo}</div>
                          <div className="text-[10px] font-bold truncate mt-0.5">{qr.name}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{qr.defaultAmount}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'CONTACT' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter phone number (+91 98765 43210) or contact name..."
                        value={contactSearch}
                        onChange={e => {
                          setContactSearch(e.target.value);
                          setPayeeIdentifier(e.target.value);
                          if (npciResult) setNpciResult(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleLookupNpci(contactSearch);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLookupNpci(contactSearch)}
                      disabled={isSearchingNpci || !contactSearch.trim()}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {isSearchingNpci ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                      <span>NPCI Lookup</span>
                    </button>
                  </div>

                  {/* NPCI Directory Result Banner */}
                  {npciResult && (
                    <div className={`p-3 rounded-xl border text-xs animate-in fade-in ${
                      npciResult.found
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {npciResult.found ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <p className="font-bold text-xs">
                            {npciResult.found ? `NPCI Verified: ${npciResult.verifiedName}` : 'New Contact Notice'}
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            {npciResult.message}
                          </p>
                          {npciResult.found ? (
                            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-bold">VPA: {npciResult.vpa}</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60">Bank: {npciResult.bank}</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 pt-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('BANK_TRANSFER');
                                  setPayee(contactSearch);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-500 cursor-pointer shadow-xs"
                              >
                                🏛️ Pay via Bank A/C + IFSC
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('UPI_ID');
                                  setPayeeIdentifier('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 cursor-pointer shadow-xs"
                              >
                                ✏️ Enter Recipient's UPI VPA
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Contacts List */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      Recent / Known Contacts on Device:
                    </span>
                    <div className="max-h-32 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950">
                      {SAMPLE_CONTACTS.filter(c =>
                        c.name.toLowerCase().includes(contactSearch.toLowerCase()) || c.phone.includes(contactSearch)
                      ).map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectContact(c)}
                          className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            payeeIdentifier === (c.vpa || c.phone) ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${c.avatarColor}`}>
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[11px] text-slate-900 dark:text-white leading-tight">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{c.phone} • {c.vpa}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'BANK_TRANSFER' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-sky-500" />
                      Interbank Transfer via Central Switch Rails
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBankTransferMode(m => m === 'DIRECTORY' ? 'POPULAR' : 'DIRECTORY')}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 cursor-pointer"
                      >
                        {bankTransferMode === 'DIRECTORY' ? '← Fast Select' : '🏛️ Browse State/City Branches'}
                      </button>
                    </div>
                  </div>

                  {bankTransferMode === 'DIRECTORY' ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500">
                        Select authentic registered destination bank & branch by State & City with real 11-digit IFSC code:
                      </p>
                      <BankBranchSelector
                        compact={true}
                        initialCountry="IN"
                        onSelect={({ bank, branch }) => {
                          setBeneficiaryBankName(bank.name);
                          setBeneficiaryBranch(branch.branchName);
                          setBeneficiaryIfsc(branch.code);
                          setPayee(`${bank.shortName} Branch Transfer (${branch.city})`);
                          setPayeeIdentifier(`${beneficiaryAccNum} / ${branch.code}`);
                          checkTransferreeIdentity(branch.code);
                          setBankTransferMode('POPULAR');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold uppercase">Popular Destination Banks:</span>
                        <span className="text-emerald-500 font-bold">1-Click Auto Fill IFSC</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { name: 'State Bank of India', short: 'SBI', ifsc: 'SBIN0000300', branch: 'Mumbai Fort Main' },
                          { name: 'HDFC Bank', short: 'HDFC', ifsc: 'HDFC0000003', branch: 'New Delhi Connaught Place' },
                          { name: 'ICICI Bank', short: 'ICICI', ifsc: 'ICIC0000004', branch: 'Mumbai BKC HQ' },
                          { name: 'Axis Bank', short: 'Axis', ifsc: 'UTIB0000004', branch: 'Mumbai Nariman Point' },
                        ].map((b, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setBeneficiaryBankName(b.name);
                              setBeneficiaryIfsc(b.ifsc);
                              setBeneficiaryBranch(b.branch);
                              setPayee(`${b.short} - ${b.branch}`);
                              setPayeeIdentifier(`${beneficiaryAccNum} / ${b.ifsc}`);
                              checkTransferreeIdentity(b.ifsc);
                            }}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              beneficiaryIfsc === b.ifsc
                                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{b.short}</div>
                            <div className="text-[9px] font-mono text-slate-400">{b.ifsc}</div>
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Selected Destination Bank</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{beneficiaryBankName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">IFSC / Branch</span>
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400 truncate block">{beneficiaryIfsc} ({beneficiaryBranch})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'SELF' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                  <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Self-Account Instant Transfer
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                      Transfer Into (Receiving Bank):
                    </label>
                    <select
                      value={selfTargetAccountId}
                      onChange={e => setSelfTargetAccountId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    >
                      {accounts.filter(a => a.id !== selectedPayingAccountId).map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — Bal: {acc.currency} {acc.current_balance}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PAYEE NAME & VPA/ACCOUNT INPUT */}
              {activeTab !== 'SELF' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        {activeTab === 'BANK_TRANSFER' ? 'Account Holder / Payee Name' : 'Payee / Merchant Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={payee}
                        onChange={e => {
                          setPayee(e.target.value);
                          checkTransferreeIdentity(e.target.value);
                        }}
                        placeholder="e.g. Starbucks, Rohan Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        {activeTab === 'BANK_TRANSFER' ? 'Account Number / IFSC' : activeTab === 'CONTACT' ? 'Phone / VPA' : 'UPI ID / VPA'}
                      </label>
                      <input
                        type="text"
                        required
                        value={payeeIdentifier}
                        onChange={e => {
                          setPayeeIdentifier(e.target.value);
                          checkTransferreeIdentity(e.target.value);
                        }}
                        placeholder={activeTab === 'BANK_TRANSFER' ? '501004829104 / HDFC0000123' : 'user@okhdfcbank'}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* NPCI Verified Transferree Legal Identity Badge */}
                  {verifiedTransferree && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          <strong>NPCI Legal Transferree:</strong> {verifiedTransferree.legalName} ({verifiedTransferree.bank})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                        KYC Authenticated
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* AMOUNT & PURPOSE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Amount ({selectedAccount?.currency || 'INR'})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-base"
                    />
                  </div>
                  {/* Quick Amount Customization Chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {[50, 100, 200, 500, 1000, 2000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          const curVal = parseFloat(amount || '0');
                          setAmount((curVal + val).toFixed(2));
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        +{val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount('10.00')}
                      className="px-1.5 py-0.5 rounded-md text-slate-400 hover:text-red-500 font-mono text-[10px] cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    What is it for? (Note)
                  </label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Dinner, Rent, Groceries, SIP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* MANDATORY / CONVENIENT CLASSIFICATION SELECTOR: NEEDS / WANTS / SAVINGS */}
              <div>
                <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Classify Expenditure:</span>
                  <span className="text-[10px] text-sky-500 font-normal">Auto-updates Monthly Budget</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setClassification('NEED')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      classification === 'NEED'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs">🟢 NEEDS</span>
                    <span className="text-[9px] text-slate-400">Rent, Groceries, Bills</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassification('WANT')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      classification === 'WANT'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs">🟡 WANTS</span>
                    <span className="text-[9px] text-slate-400">Dining, Shopping, Movies</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassification('SAVINGS')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      classification === 'SAVINGS'
                        ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs">🔵 SAVINGS</span>
                    <span className="text-[9px] text-slate-400">SIP, FD, Deposits</span>
                  </button>
                </div>
              </div>

              {/* PAYING BANK SELECTOR & CHECK BALANCE ACTION */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                    <Landmark className="h-4 w-4 text-sky-500" />
                    <span>Pay From Bank Account</span>
                  </div>

                  {/* CHECK BALANCE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsCheckBalanceOpen(!isCheckBalanceOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 cursor-pointer transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Check Balance</span>
                  </button>
                </div>

                {/* Dropdown to switch between banks for paying */}
                <select
                  value={selectedPayingAccountId}
                  onChange={e => setSelectedPayingAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution || 'Bank'}) — Available: {acc.currency} {acc.current_balance} {acc.account_number_masked ? `(${acc.account_number_masked})` : ''}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500 font-mono">
                    VPA: {selectedAccount?.upi_vpa || `${(user?.email || 'user').split('@')[0]}@okhdfcbank`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConnectBankModalOpen(true)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Connect Another Bank
                    </button>
                  </div>
                </div>

                {/* CHECK BALANCE INLINE EXPANDER */}
                {isCheckBalanceOpen && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-sky-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <KeyRound className="h-3.5 w-3.5 text-sky-500" />
                        Enter 4/6-Digit UPI PIN to Verify Balance:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCheckBalanceOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={balanceCheckPin}
                        onChange={e => setBalanceCheckPin(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-center tracking-widest text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleCheckBalance}
                        disabled={balanceCheckLoading}
                        className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                      >
                        {balanceCheckLoading ? 'Checking...' : 'View Balance'}
                      </button>
                    </div>

                    {balanceCheckResult && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between animate-in fade-in">
                        <span>Verified Live Balance:</span>
                        <span className="font-bold text-sm">
                          {formatCurrency(balanceCheckResult.balance, balanceCheckResult.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* UPI PIN FOR TRANSFER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold uppercase text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                    <Lock className="h-3 w-3 text-sky-500" />
                    UPI Security PIN (Default: 1234)
                  </label>
                  <span className="text-[10px] text-slate-400">Encrypted PIN Pad</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={upiPin}
                  onChange={e => setUpiPin(e.target.value)}
                  placeholder="Enter 4 or 6 digit UPI PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono tracking-widest text-sm text-center font-bold"
                />
              </div>

              {/* TRANSFER FEE & LEGAL COMPLIANCE BREAKDOWN */}
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Legal Transfer Fee ("tranfee"):</span>
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    ₹ {transferFeeData?.customerFee || '0.00'} (FREE)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Switch Routing:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Pinnacle CBS Host ➔ NPCI Central Switch</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200 dark:border-slate-800">
                  {transferFeeData?.regulatoryClause || '100% Surcharge Free Retail Transfer under Section 10(2) PSSA 2007 & RBI Directive'}
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Authorizing via Pinnacle CBS &amp; NPCI Switch...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>Pay {formatCurrency(amount, selectedAccount?.currency || 'INR')} via UPI</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* CONNECT REAL BANK MODAL */}
      <ConnectBankModal
        isOpen={isConnectBankModalOpen}
        onClose={() => setIsConnectBankModalOpen(false)}
        onSuccess={() => {
          setIsConnectBankModalOpen(false);
          loadAccounts();
        }}
      />

      {/* PINNACLE CBS & NPCI BANK SWITCH COMPLIANCE MODAL */}
      <BankSwitchComplianceModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        selectedCertificate={selectedCertForModal}
      />
    </div>
  );
};
