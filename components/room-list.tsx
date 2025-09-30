"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Home } from "lucide-react"

interface Room {
  id: string
  room_number: string
  floor_number: number
  monthly_rent: number
}

export function RoomList() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    room_number: "",
    floor_number: 1,
    monthly_rent: 0,
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

    if (editingRoom) {
      const { error } = await supabase
        .from("rooms")
        .update({
          room_number: formData.room_number,
          floor_number: formData.floor_number,
          monthly_rent: formData.monthly_rent,
        })
        .eq("id", editingRoom.id)

      if (error) {
        toast({
          title: "त्रुटि",
          description: "कोठा अपडेट गर्न सकिएन",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "सफल",
        description: "कोठा सफलतापूर्वक अपडेट गरियो",
      })
    } else {
      const { error } = await supabase.from("rooms").insert({
        room_number: formData.room_number,
        floor_number: formData.floor_number,
        monthly_rent: formData.monthly_rent,
      })

      if (error) {
        toast({
          title: "त्रुटि",
          description: "कोठा थप्न सकिएन",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "सफल",
        description: "कोठा सफलतापूर्वक थपियो",
      })
    }

    setFormData({ room_number: "", floor_number: 1, monthly_rent: 0 })
    setEditingRoom(null)
    setShowForm(false)
    setLoading(false)
    loadRooms()
  }

  async function handleDelete(id: string) {
    if (!confirm("के तपाईं यो कोठा मेटाउन चाहनुहुन्छ?")) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("rooms").delete().eq("id", id)

    if (error) {
      toast({
        title: "त्रुटि",
        description: "कोठा मेटाउन सकिएन",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "सफल",
      description: "कोठा सफलतापूर्वक मेटाइयो",
    })

    loadRooms()
  }

  function startEdit(room: Room) {
    setEditingRoom(room)
    setFormData({
      room_number: room.room_number,
      floor_number: room.floor_number,
      monthly_rent: room.monthly_rent,
    })
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingRoom(null)
    setFormData({ room_number: "", floor_number: 1, monthly_rent: 0 })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          नयाँ कोठा थप्नुहोस्
        </Button>
      )}

      {showForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{editingRoom ? "कोठा सम्पादन गर्नुहोस्" : "नयाँ कोठा थप्नुहोस्"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="room_number">कोठा नम्बर *</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="floor_number">तल्ला नम्बर *</Label>
                <Input
                  id="floor_number"
                  type="number"
                  value={formData.floor_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor_number: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="monthly_rent">मासिक भाडा (रु.) *</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_rent: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "सेभ गर्दै..." : editingRoom ? "अपडेट गर्नुहोस्" : "थप्नुहोस्"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1 bg-transparent">
                  रद्द गर्नुहोस्
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">कोठा {room.room_number}</h3>
                    <p className="text-sm text-gray-600">तल्ला: {room.floor_number}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">रु. {room.monthly_rent}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(room)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(room.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && !showForm && (
        <Card className="bg-white shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">कुनै कोठा छैन</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
