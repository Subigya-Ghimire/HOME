import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, Zap, Home } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default async function Dashboard() {
  const supabase = await getSupabaseServerClient()

  const [tenantsResult, billsResult, readingsResult, roomsResult] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("bills").select("*", { count: "exact", head: true }),
    supabase.from("meter_readings").select("*", { count: "exact", head: true }),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
  ])

  const stats = {
    tenants: tenantsResult.error ? 0 : tenantsResult.count || 0,
    bills: billsResult.error ? 0 : billsResult.count || 0,
    readings: readingsResult.error ? 0 : readingsResult.count || 0,
    rooms: roomsResult.error ? 0 : roomsResult.count || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">भाडा व्यवस्थापन</h1>
          <p className="text-gray-600">घर भाडा र बिजुली बिल व्यवस्थापन प्रणाली</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                भाडामा
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600" aria-label={`${stats.tenants} भाडामा`}>
                {stats.tenants}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" />
                बिलहरू
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" aria-label={`${stats.bills} बिलहरू`}>
                {stats.bills}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="h-4 w-4" aria-hidden="true" />
                रिडिङ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600" aria-label={`${stats.readings} रिडिङ`}>
                {stats.readings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                कोठाहरू
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600" aria-label={`${stats.rooms} कोठाहरू`}>
                {stats.rooms}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">नयाँ भाडामा</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">नयाँ भाडामा बस्ने व्यक्ति थप्नुहोस्</p>
              <Button asChild className="w-full">
                <Link href="/new-tenant">थप्नुहोस्</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">नयाँ बिल</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">महिनाको भाडा बिल बनाउनुहोस्</p>
              <Button asChild className="w-full">
                <Link href="/new-bill">बनाउनुहोस्</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">नयाँ रिडिङ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">बिजुली मिटर रिडिङ राख्नुहोस्</p>
              <Button asChild className="w-full">
                <Link href="/new-reading">राख्नुहोस्</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
