"use client";

const KARATS = [24, 22, 18, 14, 9];
const WEIGHTS = [1, 5, 10, 100];

export default function PriceTable({ baseRate }) {
  const perGramRate24 = baseRate / 10;

  return (
    <section id="gold-price-breakdown-weight" className="py-20 md:py-32 bg-white border-t border-zinc-50">
      <div className="container-main px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-[18px] md:text-[28px] font-medium text-zinc-900 uppercase tracking-tight font-abhaya">
                GST Price Breakdown
            </h2>
            <p className="text-zinc-400 font-figtree tracking-[0.2em] uppercase text-[10px] md:text-[12px] font-bold">
                By Gold Weight & Purity
            </p>
            <div className="h-1 w-12 bg-primary/20 mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-[2rem] shadow-sm border border-zinc-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-[#f6f0ea]/50">
                    <th className="p-6 md:p-8 text-[12px] md:text-[14px] font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-100 text-left font-figtree">Carat</th>
                    {WEIGHTS.map(w => (
                    <th key={w} className="p-6 md:p-8 text-[12px] md:text-[14px] font-bold text-zinc-900 uppercase tracking-widest border-b border-l border-zinc-100 text-center font-figtree">
                        {w} GM
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                {KARATS.map(karat => {
                    const karatFactor = karat / 24;
                    return (
                    <tr key={karat} className="hover:bg-[#FAF3EC]/30 transition-colors">
                        <td className="p-6 md:p-8 text-[14px] md:text-[18px] font-bold text-zinc-900 border-r border-zinc-100 font-figtree">{karat} KT</td>
                        {WEIGHTS.map(w => {
                        const price = perGramRate24 * w * karatFactor;
                        return (
                            <td key={w} className="p-6 md:p-8 text-[14px] md:text-[18px] text-zinc-600 text-center border-l border-zinc-100 font-figtree">
                            ₹{Math.round(price).toLocaleString('en-IN')}
                            </td>
                        );
                        })}
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.1em] font-figtree">
                *Prices are subject to real-time market fluctuations*
            </p>
        </div>
      </div>
      <style jsx>{`
        .font-abhaya { font-family: var(--font-abhaya), serif; }
        .font-figtree { font-family: var(--font-figtree), sans-serif; }
      `}</style>
    </section>
  );
}
