"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm } from "@/components/event-form"

interface NewEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewEventDialog({ open, onOpenChange }: NewEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Enter the details of your upcoming event to get outfit recommendations.</DialogDescription>
        </DialogHeader>
        <EventForm />
      </DialogContent>
    </Dialog>
  )
}

