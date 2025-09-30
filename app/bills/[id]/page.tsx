import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { notFound } from "next/navigation"
import { BillPaymentForm } from "@/components/bill-payment-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === "create" || id === "new") {
    notFound()
  }

  const supabase = await getSupabaseServerClient()

  const { data: bill, error } = await supabase
    .from("bills")
    .select("*, tenants(name, phone, rooms(room_number, floor_number))")
    .eq("id", id)
    .single()

  if (error || !bill) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/bills">
              <ArrowLeft className="h-4 w-4 mr-2" />
              पछाडि जानुहोस्
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">बिल विवरण</h1>
          <p className="text-gray-600 text-sm mt-1">
            {bill.tenants?.name} - {bill.bill_month}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">भाडामा जानकारी</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">नाम</p>
                <p className="font-semibold">{bill.tenants?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">फोन</p>
                <p className="font-semibold">{bill.tenants?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">कोठा</p>
                <p className="font-semibold">
                  {bill.tenants?.rooms?.room_number} (तल्ला: {bill.tenants?.rooms?.floor_number})
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">बिल जानकारी</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">महिना</p>
                <p className="font-semibold">{bill.bill_month}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">मिति</p>
                <p className="font-semibold">{new Date(bill.bill_date).toLocaleDateString("ne-NP")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">स्थिति</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    bill.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : bill.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {bill.status === "paid" ? "भुक्तानी भयो" : bill.status === "partial" ? "आंशिक" : "बाँकी"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">रकम विवरण</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bill.previous_balance !== 0 && (
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">पहिलाको बाँकी</span>
                <span className="font-semibold text-yellow-600">रु. {bill.previous_balance}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">घर भाडा</span>
              <span className="font-semibold">रु. {bill.rent_amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">बिजुली</span>
              <span className="font-semibold">रु. {bill.electricity_amount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">जम्मा रकम</span>
              <span className="text-xl font-bold text-blue-600">रु. {bill.total_amount}</span>
            </div>
            {bill.paid_amount > 0 && (
              <>
                <div className="flex justify-between items-center text-green-600">
                  <span>भुक्तानी भएको</span>
                  <span className="font-semibold">रु. {bill.paid_amount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">बाँकी रकम</span>
                  <span
                    className={`text-xl font-bold ${bill.remaining_balance > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    रु. {bill.remaining_balance}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {bill.status !== "paid" && <BillPaymentForm billId={bill.id} remainingBalance={bill.remaining_balance} />}
      </div>

      <Navigation />
    </div>
  )
}
