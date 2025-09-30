import { Navigation } from "@/components/navigation"
import { BillForm } from "@/components/bill-form"

export default function NewBillPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <Navigation />

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">नयाँ बिल बनाउनुहोस्</h1>
          <p className="text-gray-600 text-sm mt-1">महिनाको भाडा बिल बनाउनुहोस्</p>
        </div>

        <BillForm />
      </div>
    </div>
  )
}
