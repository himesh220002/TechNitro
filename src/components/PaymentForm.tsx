import { useState } from 'react'

const upiBanks = [
  'ybl',         // PhonePe (Yes Bank)
  'okhdfc',      // HDFC Bank
  'jupiteraxis', // Jupiter (Axis Bank)
  'oksbi',       // SBI
  'paytm',       // Paytm Payments Bank
  'pingpay',
  'ibl',         // IndusInd Bank
  'okicici',     // ICICI Bank
  'okaxis',      // Axis Bank
  'okidbi',      // IDBI Bank
  'okyesbank',   // Yes Bank
  'okbob',       // Bank of Baroda
  'okcanara',    // Canara Bank
  'okunion',     // Union Bank
  'oksaraswat',  // Saraswat Bank
  'okfederal',   // Federal Bank
  'okkotak',     // Kotak Mahindra Bank
  'oksouthindian', // South Indian Bank
  'airtel',      // Airtel Payments Bank
  'upi',         // Generic fallback
]

type Props = {
  accountName: string
  accountNumber: string
  paymentMethod: string
  onChange: (info: { accountName: string; accountNumber: string; paymentMethod: string }) => void
}



export default function PaymentForm({
  accountName,
  accountNumber,
  paymentMethod,
  onChange,
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleUpiTyping = (value: string) => {
    onChange({ accountName, accountNumber: value, paymentMethod })
    const atIndex = value.indexOf('@')
    if (atIndex >= 0) {
      const typed = value.slice(atIndex + 1).toLowerCase()
      const matches = upiBanks.filter((b) => b.startsWith(typed)).slice(0, 4)
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }



  return (
    <div className="space-y-4 mt-10">
      <h2 className="text-xl font-semibold text-white">💰 Payment Info</h2>

      <input
        type="text"
        placeholder="Account Holder Name"
        value={accountName}
        onChange={(e) => onChange({ accountName: e.target.value, accountNumber, paymentMethod })}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white"
      />

      <select
        value={paymentMethod}
        onChange={(e) => onChange({ accountName, accountNumber, paymentMethod: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
      >
        <option value="Bank" className="bg-gray-800 text-gray-200">Bank Transfer</option>
        <option value="UPI" className="bg-gray-800 text-gray-200">UPI</option>
        <option value="Wallet" className="bg-gray-800 text-gray-200">Wallet</option>
      </select>

      <input
        type="text"
        placeholder={paymentMethod === 'UPI' ? 'Enter UPI ID' : 'Account No. / Wallet ID'}
        value={accountNumber}
        onChange={(e) =>
          paymentMethod === 'UPI'
            ? handleUpiTyping(e.target.value)
            : onChange({ accountName, accountNumber: e.target.value, paymentMethod })
        }
        className="w-full px-4 py-2 rounded bg-gray-800 text-white"
      />

      {paymentMethod === 'UPI' && suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() =>
                onChange({
                  accountName,
                  accountNumber: accountNumber.split('@')[0] + '@' + s,
                  paymentMethod,
                })
              }
              className="px-2 py-1 bg-purple-700 text-white rounded hover:bg-purple-600 text-sm"
            >
              @{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

