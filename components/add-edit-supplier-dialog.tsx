"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupplier, updateSupplier } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]

interface AddEditSupplierDialogProps {
  supplier?: Supplier | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddEditSupplierDialog({ supplier, isOpen, onClose, onSuccess }: AddEditSupplierDialogProps) {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = supplier ? await updateSupplier(formData) : await createSupplier(formData)

      if (result.success) {
        toast({
          title: t("success"),
          description: supplier ? t("supplier_updated") : t("supplier_created"),
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
        description: error instanceof Error ? error.message : t("failed_to_save_supplier"),
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
          <DialogTitle>{supplier ? t("edit_supplier") : t("add_supplier")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {supplier && <Input type="hidden" name="id" value={supplier.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required defaultValue={supplier?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t("code")}</Label>
            <Input id="code" name="code" defaultValue={supplier?.code || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">{t("contact_person")}</Label>
            <Input id="contact_person" name="contact_person" defaultValue={supplier?.contact_person || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" defaultValue={supplier?.email || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" defaultValue={supplier?.phone || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" name="address" defaultValue={supplier?.address || ""} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : supplier ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

