"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteSupplier } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

interface DeleteSupplierAlertProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  supplierName: string
}

export function DeleteSupplierAlert({ isOpen, onClose, onConfirm, supplierName }: DeleteSupplierAlertProps) {
  const { t } = useLanguage()

  const handleDelete = async () => {
    try {
      const result = await deleteSupplier(supplierName)
      if (result.success) {
        toast({
          title: t("success"),
          description: t("supplier_deleted"),
        })
        onConfirm()
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
        description: error instanceof Error ? error.message : t("failed_to_delete_supplier"),
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete_supplier")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_supplier_confirmation").replace("{supplierName}", supplierName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

