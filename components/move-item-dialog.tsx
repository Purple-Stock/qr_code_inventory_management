"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { recordItemMovement } from "@/lib/location-history"

interface MoveItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  itemId: number
  itemName: string
  locations: Array<{ id: number; name: string }>
  currentLocationId?: number | null
  maxQuantity: number
}

export function MoveItemDialog({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  locations,
  currentLocationId,
  maxQuantity,
}: MoveItemDialogProps) {
  const { t } = useLanguage()
  const [fromLocationId, setFromLocationId] = useState<string>(currentLocationId?.toString() || "")
  const [toLocationId, setToLocationId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromLocationId || !toLocationId) {
      toast({
        title: t("error"),
        description: t("select_both_locations"),
        variant: "destructive",
      })
      return
    }

    if (fromLocationId === toLocationId) {
      toast({
        title: t("error"),
        description: t("locations_must_be_different"),
        variant: "destructive",
      })
      return
    }

    if (quantity <= 0 || quantity > maxQuantity) {
      toast({
        title: t("error"),
        description: t("invalid_quantity"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await recordItemMovement(
        itemId,
        Number.parseInt(fromLocationId),
        Number.parseInt(toLocationId),
        quantity,
        null,
        notes,
        "move",
      )

      if (success) {
        toast({
          title: t("success"),
          description: t("item_moved_successfully"),
        })
        onSuccess()
      } else {
        toast({
          title: t("error"),
          description: t("failed_to_move_item"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("failed_to_move_item"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("move_item")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("item")}</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-medium">{itemName}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromLocation">{t("from_location")}</Label>
            <Select value={fromLocationId} onValueChange={setFromLocationId}>
              <SelectTrigger id="fromLocation">
                <SelectValue placeholder={t("select_location")} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toLocation">{t("to_location")}</Label>
            <Select value={toLocationId} onValueChange={setToLocationId}>
              <SelectTrigger id="toLocation">
                <SelectValue placeholder={t("select_location")} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t("max_available")}: {maxQuantity}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("optional_notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("moving") : t("move")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

