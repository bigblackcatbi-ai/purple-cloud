"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
}: {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void
}) {
  return <AlertDialog><AlertDialogTrigger render={trigger as React.ReactElement} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={onConfirm}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}

export function ConfirmButton({
  children,
  title,
  description,
  onConfirm,
}: {
  children: React.ReactNode
  title: string
  description: string
  onConfirm: () => void
}) {
  return <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="text-destructive" aria-label={title}>{children}</Button>} title={title} description={description} onConfirm={onConfirm} />
}