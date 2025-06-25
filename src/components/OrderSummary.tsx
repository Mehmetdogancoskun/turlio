'use client'
import type { CartItem } from '@/context/CartContext'

const n = (v: unknown)=>Number(String(v ?? '0').replace(',', '.'))

export default function OrderSummary({ cart }:{ cart:CartItem[] }) {
  /* bölge farkı = (lineTotal – lineTotal / multiplier) */
  let sub = 0, regionExtra = 0
  cart.forEach(r=>{
    const row = n(r.lineTotal)
    sub += row
    if ((r.region_multiplier ?? 1) !== 1) {
      regionExtra += row - row/(r.region_multiplier ?? 1)
    }
  })

  const vat   = +(sub * 0.05).toFixed(2)
  const total = +(sub + vat).toFixed(2)

  return (
    <aside className="sticky top-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-bold">Sipariş Özeti</h2>

      {/* satır listesi */}
      <div className="space-y-2 text-sm">
        {cart.map((r,i)=>(
          <div key={i} className="flex justify-between">
            <span>{r.tur_adi}</span>
            <span>{n(r.lineTotal).toFixed(2)} AED</span>
          </div>
        ))}
      </div>

      <hr/>

      <div className="space-y-2 text-sm">
        <Line label="Ara toplam"      val={sub - regionExtra}/>
        {regionExtra > 0 && <Line label="Bölge farkı" val={regionExtra} />}
        <Line label="KDV %5"          val={vat}/>
        <hr/>
        <Line label="Genel Toplam"    val={total} bold/>
      </div>
    </aside>
  )
}

function Line({label,val,bold=false}:{
  label:string,val:number,bold?:boolean
}) {
  return (
    <div className={`flex justify-between ${bold?'font-heading font-bold text-base':''}`}>
      <span>{label}</span>
      <span>{val.toFixed(2)} AED</span>
    </div>
  )
}
