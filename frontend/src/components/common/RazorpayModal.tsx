import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onDismiss: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  onSuccess,
  onDismiss,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('ananya@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  if (!isOpen) return null;

  const handleSimulatePayment = (willSucceed = true) => {
    setIsProcessing(true);
    setStatus('idle');

    setTimeout(() => {
      setIsProcessing(false);
      if (willSucceed) {
        setStatus('success');
        const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 14)}`;
        const mockSignature = `sig_${Math.random().toString(36).substring(2, 24)}`;
        setTimeout(() => {
          onSuccess(mockPaymentId, mockSignature);
        }, 1200);
      } else {
        setStatus('failed');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-blue-900/10 animate-slide-up">
        {/* Razorpay Header with Brand Blue */}
        <div className="bg-[#0C2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7] flex items-center justify-center font-bold text-white shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-sm">Razorpay Checkout</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Test Mode
                </span>
              </div>
              <p className="text-[11px] text-blue-200">LIKE CLOTHING • Order {orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-blue-200 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-[#081B30] text-white px-6 py-3 flex items-center justify-between text-xs border-t border-white/10">
          <span className="text-blue-200">Amount Payable</span>
          <span className="text-base font-bold text-emerald-400">{formatINR(amount)}</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Customer prefill note */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Prefilled: <strong>{customerName}</strong></span>
            <span>{customerPhone}</span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedMethod === 'upi'
                  ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedMethod === 'card'
                  ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                selectedMethod === 'netbanking'
                  ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Method View */}
          {selectedMethod === 'upi' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-slate-700">Enter UPI ID / VPA</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">GPay</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Cred UPI</span>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="space-y-2 pt-2 text-xs">
              <input
                type="text"
                disabled
                value="4111 •••• •••• 1111 (Razorpay Test Visa)"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  value="Exp: 12/28"
                  className="w-1/2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
                <input
                  type="text"
                  disabled
                  value="CVV: 123"
                  className="w-1/2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="space-y-2 pt-2 text-xs">
              <select className="w-full p-2.5 rounded-lg border border-slate-300">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Status feedback */}
          {status === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Razorpay Signature Verified! Confirming your bridal order...</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Payment failed or declined by issuing bank. Please retry.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={isProcessing || status === 'success'}
              onClick={() => handleSimulatePayment(true)}
              className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying with Bank...
                </>
              ) : (
                `Pay ${formatINR(amount)} (Simulate Success)`
              )}
            </button>

            <button
              type="button"
              disabled={isProcessing || status === 'success'}
              onClick={() => handleSimulatePayment(false)}
              className="w-full text-slate-400 hover:text-red-500 text-[11px] text-center block transition-colors"
            >
              Simulate Payment Failure / Bank Decline
            </button>
          </div>

          {/* Security footnote */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted • PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
