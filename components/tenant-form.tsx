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

interface Room {
  id: string
  room_number: string
  floor_number: number
  monthly_rent: number
}

export function TenantForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    room_id: "",
    move_in_date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("floor_number", { ascending: true })
      .order("room_number", { ascending: true })

    if (data) {
      setRooms(data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("tenants").insert({
      name: formData.name,
      phone: formData.phone,
      room_id: formData.room_id,
      move_in_date: formData.move_in_date,
      is_active: true,
    })

    if (error) {
      toast({
        title: "त्रुटि",
        description: "भाडामा थप्न सकिएन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({
      title: "सफल",
      description: "भाडामा सफलतापूर्वक थपियो",
    })

    router.push("/tenants")
    router.refresh()
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">नाम *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">फोन नम्बर *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="room">कोठा *</Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => setFormData({ ...formData, room_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="कोठा छान्नुहोस्" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    कोठा {room.room_number} - तल्ला {room.floor_number} (रु. {room.monthly_rent})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="move_in_date">भित्रिएको मिति *</Label>
            <Input
              id="move_in_date"
              type="date"
              value={formData.move_in_date}
              onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "थप्दै..." : "थप्नुहोस्"}
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
