import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Plus, Zap } from "lucide-react"

export default async function ReadingsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: readings } = await supabase
    .from("meter_readings")
    .select("*, tenants(name, rooms(room_number))")
    .order("reading_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <Navigation />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">बिजुली रिडिङ</h1>
            <p className="text-gray-600 text-sm mt-1">सबै मिटर रिडिङहरूको सूची</p>
          </div>
          <Button asChild>
            <Link href="/new-reading">
              <Plus className="h-4 w-4 mr-2" />
              नयाँ रिडिङ
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {readings?.map((reading) => (
            <Card key={reading.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{reading.tenants?.name}</h3>
                      <p className="text-sm text-gray-600">कोठा: {reading.tenants?.rooms?.room_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(reading.reading_date).toLocaleDateString("ne-NP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">{reading.units_consumed} युनिट</p>
                    <p className="text-sm text-gray-600">
                      {reading.previous_reading} → {reading.current_reading}
                    </p>
                    <p className="text-xs text-gray-500">@ रु. {reading.rate_per_unit}/युनिट</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!readings?.length && (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">कुनै रिडिङ छैन</p>
              <Button asChild>
                <Link href="/new-reading">पहिलो रिडिङ राख्नुहोस्</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
