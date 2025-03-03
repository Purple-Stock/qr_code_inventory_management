"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Check, ChevronsUpDown, PlusCircle } from "lucide-react"

export function CompanySwitcher() {
  const { companies, currentCompany, switchCompany, createCompany } = useAuth()
  const [open, setOpen] = useState(false)
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return

    setIsCreating(true)
    try {
      const { error } = await createCompany(newCompanyName)
      if (!error) {
        setNewCompanyName("")
        setShowNewCompanyDialog(false)
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="truncate">{currentCompany?.name || "Select company"}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>My Companies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => {
                switchCompany(company.id)
                setOpen(false)
              }}
              className="flex items-center justify-between"
            >
              <span className="truncate">{company.name}</span>
              {currentCompany?.id === company.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setOpen(false)
              }}
              className="flex items-center gap-2 text-primary"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Company</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new company</DialogTitle>
          <DialogDescription>
            Add a new company to manage inventory separately from your other companies.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              placeholder="Acme Inc."
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewCompanyDialog(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateCompany} disabled={!newCompanyName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

