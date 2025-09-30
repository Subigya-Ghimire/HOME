"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface BillPaymentFormProps {
  billId: string
  remainingBalance: number
}

export function BillPaymentForm({ billId, remainingBalance }: BillPaymentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(remainingBalance)

  async function handlePayment() {
    if (paymentAmount <= 0) {
      toast({
        title: "त्रुटि",
        description: "भुक्तानी रकम ० भन्दा बढी हुनुपर्छ",
        variant: "destructive",
      })
      return
    }

    if (paymentAmount > remainingBalance) {
      toast({
        title: "त्रुटि",
        description: "भुक्तानी रकम बाँकी रकम भन्दा बढी हुन सक्दैन",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    // Get current bill data
    const { data: bill, error: fetchError } = await supabase
      .from("bills")
      .select("paid_amount, total_amount")
      .eq("id", billId)
      .single()

    if (fetchError || !bill) {
      toast({
        title: "त्रुटि",
        description: "बिल फेला परेन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const newPaidAmount = (bill.paid_amount || 0) + paymentAmount
    const newRemainingBalance = bill.total_amount - newPaidAmount
    const newStatus = newRemainingBalance <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "unpaid"

    const { error } = await supabase
      .from("bills")
      .update({
        paid_amount: newPaidAmount,
        remaining_balance: newRemainingBalance,
        status: newStatus,
      })
      .eq("id", billId)

    if (error) {
      toast({
        title: "त्रुटि",
        description: "भुक्तानी रेकर्ड गर्न सकिएन",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({
      title: "सफल",
      description: "भुक्तानी सफलतापूर्वक रेकर्ड गरियो",
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">भुक्तानी रेकर्ड गर्नुहोस्</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="payment_amount">भुक्तानी रकम *</Label>
          <Input
            id="payment_amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value) || 0)}
            max={remainingBalance}
            min="0"
            aria-required="true"
            aria-label="भुक्तानी रकम"
          />
          <p className="text-xs text-gray-500 mt-1">बाँकी रकम: रु. {remainingBalance}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setPaymentAmount(remainingBalance)} variant="outline" size="sm" type="button">
            पूर्ण भुक्तानी
          </Button>
          <Button
            onClick={() => setPaymentAmount(Math.round(remainingBalance / 2))}
            variant="outline"
            size="sm"
            type="button"
          >
            आधा भुक्तानी
          </Button>
        </div>

        <Button onClick={handlePayment} disabled={loading || paymentAmount <= 0} className="w-full">
          {loading ? "रेकर्ड गर्दै..." : "भुक्तानी रेकर्ड गर्नुहोस्"}
        </Button>
      </CardContent>
    </Card>
  )
}
