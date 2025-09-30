import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { notFound } from "next/navigation"
import { Phone, Home, Calendar, FileText, ArrowLeft } from "lucide-react"

export async function generateStaticParams() {
  return []
}

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  if (id === "create" || id === "new") {
    notFound()
  }

  const supabase = await getSupabaseServerClient()

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*, rooms(*)")
    .eq("id", id)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .eq("tenant_id", id)
    .order("bill_date", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/tenants">
              <ArrowLeft className="h-4 w-4 mr-2" />
              पछाडि जानुहोस्
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-600 text-sm mt-1">भाडामा बस्ने विवरण</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">व्यक्तिगत जानकारी</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm">{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm">
                  कोठा {tenant.rooms?.room_number} - तल्ला {tenant.rooms?.floor_number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm">भित्रिएको: {new Date(tenant.move_in_date).toLocaleDateString("ne-NP")}</span>
              </div>
              <div className="pt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    tenant.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tenant.is_active ? "सक्रिय" : "निष्क्रिय"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">कोठा जानकारी</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">मासिक भाडा</p>
                <p className="text-2xl font-bold text-blue-600">रु. {tenant.rooms?.monthly_rent}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">कोठा नम्बर</p>
                <p className="text-lg font-semibold">{tenant.rooms?.room_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">तल्ला</p>
                <p className="text-lg font-semibold">{tenant.rooms?.floor_number}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">हालका बिलहरू</CardTitle>
              <Button asChild size="sm">
                <Link href="/bills">सबै हेर्नुहोस्</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bills && bills.length > 0 ? (
              <div className="space-y-2">
                {bills.map((bill) => (
                  <Link
                    key={bill.id}
                    href={`/bills/${bill.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      <div>
                        <p className="font-medium">{bill.bill_month}</p>
                        <p className="text-sm text-gray-500">{new Date(bill.bill_date).toLocaleDateString("ne-NP")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">रु. {bill.total_amount}</p>
                      <p
                        className={`text-xs ${
                          bill.status === "paid"
                            ? "text-green-600"
                            : bill.status === "partial"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {bill.status === "paid" ? "भुक्तानी भयो" : bill.status === "partial" ? "आंशिक" : "बाँकी"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">कुनै बिल छैन</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
