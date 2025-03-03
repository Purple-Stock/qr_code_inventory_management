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
import { deleteLocation } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

interface DeleteLocationAlertProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  locationName: string
  locationId: number
}

export function DeleteLocationAlert({
  isOpen,
  onClose,
  onConfirm,
  locationName,
  locationId,
}: DeleteLocationAlertProps) {
  const { t } = useLanguage()

  const handleDelete = async () => {
    try {
      const result = await deleteLocation(locationId)
      if (result.success) {
        toast({
          title: t("success"),
          description: t("location_deleted"),
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
        description: error instanceof Error ? error.message : t("failed_to_delete_location"),
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete_location")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_location_confirmation").replace("{locationName}", locationName)}
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

