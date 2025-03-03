"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLocation, updateLocation } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"

type Location = Database["public"]["Tables"]["locations"]["Row"]

interface AddEditLocationDialogProps {
  location?: Location | null
  locations?: Location[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddEditLocationDialog({
  location,
  locations = [],
  isOpen,
  onClose,
  onSuccess,
}: AddEditLocationDialogProps) {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = location ? await updateLocation(formData) : await createLocation(formData)

      if (result.success) {
        toast({
          title: t("success"),
          description: location ? t("location_updated") : t("location_created"),
        })
        onSuccess()
      } else {
        toast({
          title: t("error"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("failed_to_save_location"),
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
          <DialogTitle>{location ? t("edit_location") : t("add_location")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {location && <Input type="hidden" name="id" value={location.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required defaultValue={location?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea id="description" name="description" defaultValue={location?.description || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">{t("parent_location")}</Label>
            <Select name="parent_id" defaultValue={location?.parent_id?.toString() || "null"}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_parent_location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">{t("none")}</SelectItem>
                {locations
                  .filter((loc) => loc.id !== location?.id)
                  .map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : location ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

