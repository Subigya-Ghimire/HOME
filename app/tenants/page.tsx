import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Plus, Phone, Home } from "lucide-react"

export default async function TenantsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: tenants } = await supabase
    .from("tenants")
    .select("*, rooms(*)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <Navigation />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">भाडामा बस्नेहरू</h1>
            <p className="text-gray-600 text-sm mt-1">सबै भाडामा बस्ने व्यक्तिहरूको सूची</p>
          </div>
          <Button asChild>
            <Link href="/new-tenant">
              <Plus className="h-4 w-4 mr-2" />
              नयाँ थप्नुहोस्
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants?.map((tenant) => (
            <Link key={tenant.id} href={`/tenants/${tenant.id}`}>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{tenant.name}</span>
                    {tenant.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">सक्रिय</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="h-4 w-4" />
                    <span>
                      कोठा: {tenant.rooms?.room_number || "N/A"} (तल्ला: {tenant.rooms?.floor_number || "N/A"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    भित्रिएको मिति: {new Date(tenant.move_in_date).toLocaleDateString("ne-NP")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!tenants?.length && (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">कुनै भाडामा बस्ने छैन</p>
              <Button asChild>
                <Link href="/new-tenant">पहिलो भाडामा थप्नुहोस्</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
