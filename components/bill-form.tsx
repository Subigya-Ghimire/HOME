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
    monthly_rent: number
    room_number: string
  } | null
}

interface Reading {
  id: string
  units_consumed: number
  rate_per_unit: number
}

export function BillForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [readings, setReadings] = useState<Reading[]>([])
  const [formData, setFormData] = useState({
    tenant_id: "",
    reading_id: "",
    bill_date: new Date().toISOString().split("T")[0],
    bill_month: "",
    rent_amount: 0,
    electricity_amount: 0,
    previous_balance: 0,
  })

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    if (formData.tenant_id) {
      loadReadings(formData.tenant_id)
      loadPreviousBalance(formData.tenant_id)
      const tenant = tenants.find((t) => t.id === formData.tenant_id)
      if (tenant?.rooms) {
        setFormData((prev) => ({
          ...prev,
          rent_amount: tenant.rooms!.monthly_rent,
        }))
      }
    }
  }, [formData.tenant_id, tenants])

  useEffect(() => {
    if (formData.reading_id) {
      const reading = readings.find((r) => r.id === formData.reading_id)
      if (reading) {
        setFormData((prev) => ({
          ...prev,
          electricity_amount: reading.units_consumed * reading.rate_per_unit,
        }))
      }
    }
  }, [formData.reading_id, readings])

  async function loadTenants() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, rooms(monthly_rent, room_number)")
      .eq("is_active", true)

    if (error) {
      toast({
        title: "त्रुटि",
        description: "भाडामा लोड गर्न सकिएन",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setTenants(data as Tenant[])
    }
  }

  async function loadReadings(tenantId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("meter_readings")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("reading_date", { ascending: false })

    if (error) {
      toast({
        title: "त्रुटि",
        description: "रिडिङ लोड गर्न सकिएन",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setReadings(data)
    }
  }

  async function loadPreviousBalance(tenantId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from("bills")
      .select("remaining_balance")
      .eq("tenant_id", tenantId)
      .order("bill_date", { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setFormData((prev) => ({
        ...prev,
        previous_balance: data.remaining_balance || 0,
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    const totalAmount = formData.rent_amount + formData.electricity_amount + formData.previous_balance

    const { error } = await supabase.from("bills").insert({
      tenant_id: formData.tenant_id,
      reading_id: formData.reading_id || null,
      bill_date: formData.bill_date,
      bill_month: formData.bill_month,
      rent_amount: formData.rent_amount,
      electricity_amount: formData.electricity_amount,
      previous_balance: formData.previous_balance,
      total_amount: totalAmount,
      paid_amount: 0,
      remaining_balance: totalAmount,
      status: "unpaid",
    })

    if (error) {
      toast({
        title: "त्रुटि",
        description: "बिल बनाउन सकिएन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({
      title: "सफल",
      description: "बिल सफलतापूर्वक बनाइयो",
    })

    router.push("/bills")
    router.refresh()
  }

  const totalAmount = formData.rent_amount + formData.electricity_amount + formData.previous_balance

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
              <SelectTrigger id="tenant" aria-label="भाडामा छान्नुहोस्">
                <SelectValue placeholder="भाडामा छान्नुहोस्" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name} - कोठा {tenant.rooms?.room_number || "N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bill_month">महिना *</Label>
            <Input
              id="bill_month"
              placeholder="जस्तै: २०८१ पुष"
              value={formData.bill_month}
              onChange={(e) => setFormData({ ...formData, bill_month: e.target.value })}
              required
              aria-required="true"
            />
          </div>

          <div>
            <Label htmlFor="bill_date">बिल मिति *</Label>
            <Input
              id="bill_date"
              type="date"
              value={formData.bill_date}
              onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
              required
              aria-required="true"
            />
          </div>

          {formData.previous_balance !== 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Label className="text-yellow-800">पहिलाको बाँकी</Label>
              <p className="text-2xl font-bold text-yellow-900">रु. {formData.previous_balance}</p>
            </div>
          )}

          <div>
            <Label htmlFor="rent_amount">घर भाडा *</Label>
            <Input
              id="rent_amount"
              type="number"
              value={formData.rent_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rent_amount: Number.parseFloat(e.target.value) || 0,
                })
              }
              required
              aria-required="true"
              min="0"
            />
          </div>

          {readings.length > 0 && (
            <div>
              <Label htmlFor="reading">बिजुली रिडिङ</Label>
              <Select
                value={formData.reading_id}
                onValueChange={(value) => setFormData({ ...formData, reading_id: value })}
              >
                <SelectTrigger id="reading" aria-label="रिडिङ छान्नुहोस्">
                  <SelectValue placeholder="रिडिङ छान्नुहोस्" />
                </SelectTrigger>
                <SelectContent>
                  {readings.map((reading) => (
                    <SelectItem key={reading.id} value={reading.id}>
                      {reading.units_consumed} युनिट @ रु. {reading.rate_per_unit} = रु.{" "}
                      {reading.units_consumed * reading.rate_per_unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="electricity_amount">बिजुली रकम</Label>
            <Input
              id="electricity_amount"
              type="number"
              value={formData.electricity_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  electricity_amount: Number.parseFloat(e.target.value) || 0,
                })
              }
              min="0"
            />
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label className="text-blue-800">जम्मा रकम</Label>
            <p className="text-3xl font-bold text-blue-900">रु. {totalAmount}</p>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>घर भाडा: रु. {formData.rent_amount}</p>
              <p>बिजुली: रु. {formData.electricity_amount}</p>
              {formData.previous_balance !== 0 && <p>पहिलाको बाँकी: रु. {formData.previous_balance}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "बनाउँदै..." : "बिल बनाउनुहोस्"}
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
