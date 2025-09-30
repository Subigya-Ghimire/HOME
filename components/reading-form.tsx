"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Tenant {
  id: string
  name: string
  rooms: {
    room_number: string
  }
}

export function ReadingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [formData, setFormData] = useState({
    tenant_id: "",
    reading_date: new Date().toISOString().split("T")[0],
    previous_reading: 0,
    current_reading: 0,
    rate_per_unit: 15, // Changed default unit rate from 10 to 15 rupees
  })

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    if (formData.tenant_id) {
      loadPreviousReading(formData.tenant_id)
    }
  }, [formData.tenant_id])

  async function loadTenants() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from("tenants").select("id, name, rooms(room_number)").eq("is_active", true)

    if (data) {
      setTenants(data as Tenant[])
    }
  }

  async function loadPreviousReading(tenantId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from("meter_readings")
      .select("current_reading")
      .eq("tenant_id", tenantId)
      .order("reading_date", { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setFormData((prev) => ({
        ...prev,
        previous_reading: data.current_reading,
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const unitsConsumed = formData.current_reading - formData.previous_reading

    if (unitsConsumed < 0) {
      toast({
        title: "त्रुटि",
        description: "हालको रिडिङ पहिलाको रिडिङ भन्दा कम हुन सक्दैन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("meter_readings").insert({
      tenant_id: formData.tenant_id,
      reading_date: formData.reading_date,
      previous_reading: formData.previous_reading,
      current_reading: formData.current_reading,
      units_consumed: unitsConsumed,
      rate_per_unit: formData.rate_per_unit,
    })

    if (error) {
      toast({
        title: "त्रुटि",
        description: "रिडिङ राख्न सकिएन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({
      title: "सफल",
      description: "रिडिङ सफलतापूर्वक राखियो",
    })

    router.push("/readings")
    router.refresh()
  }

  const unitsConsumed = formData.current_reading - formData.previous_reading
  const totalAmount = unitsConsumed * formData.rate_per_unit

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tenant">भाडामा *</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="भाडामा छान्नुहोस्" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name} - कोठा {tenant.rooms.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reading_date">रिडिङ मिति *</Label>
            <Input
              id="reading_date"
              type="date"
              value={formData.reading_date}
              onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="previous_reading">पहिलाको रिडिङ *</Label>
            <Input
              id="previous_reading"
              type="number"
              value={formData.previous_reading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  previous_reading: Number.parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="current_reading">हालको रिडिङ *</Label>
            <Input
              id="current_reading"
              type="number"
              value={formData.current_reading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_reading: Number.parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="rate_per_unit">प्रति युनिट दर (रु.) *</Label>
            <Input
              id="rate_per_unit"
              type="number"
              step="0.01"
              value={formData.rate_per_unit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rate_per_unit: Number.parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          {unitsConsumed >= 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-800">खपत युनिट</span>
                  <span className="font-bold text-yellow-900">{unitsConsumed} युनिट</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-800">जम्मा रकम</span>
                  <span className="text-xl font-bold text-yellow-900">रु. {totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "राख्दै..." : "रिडिङ राख्नुहोस्"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              रद्द गर्नुहोस्
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
