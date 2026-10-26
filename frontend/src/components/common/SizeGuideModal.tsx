import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const isShoe =
    category?.toLowerCase().includes('shoe') ||
    category?.toLowerCase().includes('sneaker') ||
    category?.toLowerCase().includes('footwear');

  // Standard Men's Clothing Size Chart
  const menApparelChart = [
    { size: 'S', chestIn: '38', shoulderIn: '17.5', lengthIn: '28', waistIn: '30-32', chestCm: '96', shoulderCm: '44', lengthCm: '71', waistCm: '76-81' },
    { size: 'M', chestIn: '40', shoulderIn: '18.5', lengthIn: '29', waistIn: '32-34', chestCm: '101', shoulderCm: '47', lengthCm: '74', waistCm: '81-86' },
    { size: 'L', chestIn: '42', shoulderIn: '19.5', lengthIn: '30', waistIn: '34-36', chestCm: '106', shoulderCm: '49', lengthCm: '76', waistCm: '86-91' },
    { size: 'XL', chestIn: '44', shoulderIn: '20.5', lengthIn: '31', waistIn: '36-38', chestCm: '112', shoulderCm: '52', lengthCm: '79', waistCm: '91-96' },
    { size: 'XXL', chestIn: '46', shoulderIn: '21.5', lengthIn: '32', waistIn: '38-40', chestCm: '117', shoulderCm: '54', lengthCm: '81', waistCm: '96-101' },
    { size: '3XL', chestIn: '48', shoulderIn: '22.5', lengthIn: '33', waistIn: '40-42', chestCm: '122', shoulderCm: '57', lengthCm: '84', waistCm: '101-106' },
  ];

  // Men's Sneakers & Streetwear Shoes Size Chart
  const menShoeChart = [
    { uk: 'UK 6', eu: '40', us: '7', cm: '25.0', in: '9.8', fit: 'True to Size' },
    { uk: 'UK 7', eu: '41', us: '8', cm: '25.8', in: '10.1', fit: 'True to Size' },
    { uk: 'UK 8', eu: '42', us: '9', cm: '26.5', in: '10.4', fit: 'Popular Fit' },
    { uk: 'UK 9', eu: '43', us: '10', cm: '27.3', in: '10.7', fit: 'Popular Fit' },
    { uk: 'UK 10', eu: '44', us: '11', cm: '28.1', in: '11.0', fit: 'Roomy Fit' },
    { uk: 'UK 11', eu: '45', us: '12', cm: '28.9', in: '11.4', fit: 'Comfort Fit' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-border animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-surface flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-brand-orange" />
            <h3 className="font-display text-base font-bold text-brand-dark">
              {isShoe ? "Men's Sneaker Sizing Guide" : "Men's Sizing & Fit Guide"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-brand-dark p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-muted">
              {category ? `Tailored fit for ${category}` : 'LIKE CLOTHING Men Standard Measurements'}
            </p>
            {/* Unit Selector */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === 'inches' ? 'bg-brand-orange text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === 'cm' ? 'bg-brand-orange text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-brand-border">
            {isShoe ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-brand-dark font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">UK Size</th>
                    <th className="py-2.5 px-3">EU</th>
                    <th className="py-2.5 px-3">US</th>
                    <th className="py-2.5 px-3">Foot Length</th>
                    <th className="py-2.5 px-3">Fit Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-slate-800">
                  {menShoeChart.map((row) => (
                    <tr key={row.uk} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-brand-orange">{row.uk}</td>
                      <td className="py-2.5 px-3 font-semibold">{row.eu}</td>
                      <td className="py-2.5 px-3">{row.us}</td>
                      <td className="py-2.5 px-3 font-medium">
                        {unit === 'inches' ? `${row.in}"` : `${row.cm} cm`}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold text-[11px]">{row.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-brand-dark font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest</th>
                    <th className="py-2.5 px-3">Shoulder</th>
                    <th className="py-2.5 px-3">Length</th>
                    <th className="py-2.5 px-3">Waist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-slate-800">
                  {menApparelChart.map((row) => (
                    <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-brand-orange">{row.size}</td>
                      <td className="py-2.5 px-3">{unit === 'inches' ? `${row.chestIn}"` : `${row.chestCm} cm`}</td>
                      <td className="py-2.5 px-3">{unit === 'inches' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}</td>
                      <td className="py-2.5 px-3">{unit === 'inches' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}</td>
                      <td className="py-2.5 px-3">{unit === 'inches' ? `${row.waistIn}"` : `${row.waistCm} cm`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Fit tips */}
          <div className="bg-orange-50/60 rounded-xl p-3 border border-orange-200 text-[11px] text-slate-700 space-y-1">
            {isShoe ? (
              <>
                <p className="font-bold text-brand-dark">👟 Streetwear Sneaker Fitting Guide:</p>
                <p>• <strong>Standard Fit:</strong> LIKE CLOTHING sneakers follow Indian/UK sizing standard.</p>
                <p>• <strong>Broad Feet:</strong> If you have wide feet or prefer loose street comfort with thick crew socks, choose one size up (e.g. UK 9 instead of UK 8).</p>
                <p>• <strong>Doorstep Exchange:</strong> 7-day hassle-free doorstep size swap available across India if the fit doesn&apos;t feel 100% perfect.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-brand-dark">🔥 Oversized Streetwear Fit Guidance:</p>
                <p>• <strong>Oversized Tees:</strong> Designed with a relaxed drop-shoulder cut. Order your true size for the intended boxy streetwear fit.</p>
                <p>• <strong>Shirts & Cargos:</strong> Standard regular fit. Choose one size up if you prefer a looser streetwear silhouette.</p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-brand-border text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-brand-orangeHover transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
