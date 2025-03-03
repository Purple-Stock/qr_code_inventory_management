"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import type { Location } from "@/types/database"

interface ScannedItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: number
    name: string
    sku: string
    price?: number
    current_quantity: number
    item_locations?: {
      location_id: number
      current_quantity: number
    }[]
  }
  locations: Location[]
  mode: "stock_in" | "stock_out" | "move" | "adjust" | "info"
  onSubmit: (data: any) => Promise<void>
}

export function ScannedItemModal({ isOpen, onClose, item, locations = [], mode, onSubmit }: ScannedItemModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStock, setCurrentStock] = useState(0)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setFromLocation("")
      setToLocation("")
      setCurrentStock(0)
    }
  }, [isOpen])

  // Update current stock when location changes
  useEffect(() => {
    if (mode === "stock_out" && fromLocation && item?.item_locations) {
      const locationStock =
        item.item_locations.find((loc) => loc.location_id === Number.parseInt(fromLocation))?.current_quantity || 0
      setCurrentStock(locationStock)
    }
  }, [fromLocation, item?.item_locations, mode])

  const handleSubmit = async () => {
    try {
      if (!toLocation && mode !== "stock_out") {
        toast({
          title: t("error"),
          description: t("please_select_location"),
          variant: "destructive",
        })
        return
      }

      if (!fromLocation && mode === "stock_out") {
        toast({
          title: t("error"),
          description: t("please_select_location"),
          variant: "destructive",
        })
        return
      }

      if (mode === "stock_out" && quantity > currentStock) {
        toast({
          title: t("error"),
          description: t("insufficient_stock"),
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)
      await onSubmit({
        itemId: item.id,
        quantity,
        fromLocation: fromLocation ? Number.parseInt(fromLocation) : null,
        toLocation: toLocation ? Number.parseInt(toLocation) : null,
        item: {
          name: item.name,
          sku: item.sku,
          currentStock,
        },
      })

      toast({
        title: t("success"),
        description: t("item_updated_successfully"),
      })
      onClose()
      router.refresh()
    } catch (error) {
      console.error("Error submitting:", error)
      toast({
        title: t("error"),
        description: t("failed_to_update_item"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!locations.length) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("error")}</DialogTitle>
            <DialogDescription>{t("no_locations_available")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const renderContent = () => {
    if (!item) return null

    switch (mode) {
      case "stock_in":
        return (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("location")}</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
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
                <Label>{t("quantity")}</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting || !toLocation}>
                {isSubmitting ? t("submitting") : t("stock_in")}
              </Button>
            </DialogFooter>
          </>
        )

      case "stock_out":
        return (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("location")}</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
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
                <Label>{t("current_stock")}</Label>
                <div className="text-sm text-muted-foreground">{currentStock}</div>
              </div>
              <div className="space-y-2">
                <Label>{t("quantity")}</Label>
                <Input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting || !fromLocation || quantity > currentStock}>
                {isSubmitting ? t("submitting") : t("stock_out")}
              </Button>
            </DialogFooter>
          </>
        )

      case "move":
        return (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("from_location")}</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
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
                <Label>{t("to_location")}</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
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
                <Label>{t("quantity")}</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting || !fromLocation || !toLocation}>
                {isSubmitting ? t("moving") : t("move")}
              </Button>
            </DialogFooter>
          </>
        )

      case "adjust":
        return (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("location")}</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
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
                <Label>{t("new_quantity")}</Label>
                <Input type="number" min="0" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting || !toLocation}>
                {isSubmitting ? t("adjusting") : t("adjust")}
              </Button>
            </DialogFooter>
          </>
        )

      case "info":
      default:
        return (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("sku")}</Label>
                <div className="mt-1 text-sm">{item.sku}</div>
              </div>
              <div>
                <Label>{t("name")}</Label>
                <div className="mt-1 text-sm">{item.name}</div>
              </div>
              <div>
                <Label>{t("current_stock")}</Label>
                <div className="mt-1 text-sm">{item.current_quantity}</div>
              </div>
              <div>
                <Label>{t("price")}</Label>
                <div className="mt-1 text-sm">${item.price}</div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => router.push(`/items/${item.id}`)}>{t("view_details")}</Button>
            </DialogFooter>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item?.name}</DialogTitle>
          <DialogDescription>{mode === "info" ? t("item_details") : t("update_item_details")}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}

