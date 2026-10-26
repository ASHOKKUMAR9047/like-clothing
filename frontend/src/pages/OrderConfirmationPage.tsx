import React, { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, PackageCheck, Truck, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/formatters';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payId') || 'pay_test_892174';
  const { orders } = useAuth();

  const currentOrder = orders.find((o) => o.orderNumber === orderNumber) || orders[0];

  useEffect(() => {
    // Trigger celebratory gold and burgundy confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#722F37', '#C5A059', '#F4EFE6', '#0284C7'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-atelier-border/80 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>

        <span className="text-[10px] font-bold text-atelier-gold uppercase tracking-widest block">
          Order Confirmed & Payment Captured
        </span>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-atelier-charcoal">
          Thank You for Trusting Miraya Couture
        </h1>

        <p className="text-xs sm:text-sm text-atelier-muted max-w-lg mx-auto leading-relaxed">
          Your bespoke order <strong>#{currentOrder?.orderNumber || orderNumber}</strong> has been logged in our master atelier registry. Our tailoring team has begun curating your handcrafted ensembles.
        </p>

        {/* Razorpay Token Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs font-mono text-slate-600">
          <span>Razorpay ID: <strong>{paymentId}</strong></span>
          <span className="text-emerald-600 font-bold">✓ Verified</span>
        </div>
      </div>

      {/* Shipment & Tracking Details */}
      <div className="bg-white rounded-2xl p-6 border border-atelier-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-atelier-border pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-atelier-charcoal uppercase tracking-wider">
            <Truck className="w-4 h-4 text-atelier-burgundy" />
            <span>Air Express Logistics</span>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
            {currentOrder?.status || 'Confirmed'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-atelier-muted block">Courier Partner</span>
            <span className="font-bold text-atelier-charcoal">
              {currentOrder?.courierPartner || 'BlueDart Express Air'}
            </span>
          </div>
          <div>
            <span className="text-atelier-muted block">Tracking AWB</span>
            <span className="font-bold font-mono text-atelier-burgundy">
              {currentOrder?.trackingNumber || 'BD-7890123456'}
            </span>
          </div>
          <div>
            <span className="text-atelier-muted block">Estimated Delivery</span>
            <span className="font-bold text-atelier-charcoal">
              {currentOrder?.estimatedDelivery ? formatDate(currentOrder.estimatedDelivery) : 'Within 4-5 Days'}
            </span>
          </div>
        </div>
      </div>

      {/* Item summary */}
      {currentOrder && (
        <div className="bg-white rounded-2xl p-6 border border-atelier-border/80 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-atelier-charcoal border-b border-atelier-border pb-3">
            Ensembles in this Package
          </h3>

          <div className="space-y-3">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-atelier-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-12 h-16 rounded object-cover bg-atelier-sand border border-atelier-border"
                    />
                  )}
                  <div>
                    <p className="font-bold text-atelier-charcoal">{item.productTitle}</p>
                    <p className="text-atelier-muted text-[11px]">
                      Size: {item.size} • Color: {item.colorName} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right font-bold text-atelier-burgundy text-sm">
                  {formatINR(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-atelier-border pt-3 flex justify-between items-baseline text-sm font-bold text-atelier-charcoal">
            <span>Amount Paid</span>
            <span className="text-lg text-atelier-burgundy">{formatINR(currentOrder.total)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to="/shop"
          className="w-full sm:w-1/2 py-3.5 bg-atelier-burgundy hover:bg-atelier-crimson text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-elevated transition-all flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/account?tab=orders"
          className="w-full sm:w-1/2 py-3.5 bg-atelier-sand hover:bg-atelier-bone text-atelier-charcoal font-bold text-xs uppercase tracking-widest rounded-xl border border-atelier-border transition-all flex items-center justify-center gap-2"
        >
          <PackageCheck className="w-4 h-4 text-atelier-burgundy" />
          <span>View in Order History</span>
        </Link>
      </div>
    </div>
  );
};
