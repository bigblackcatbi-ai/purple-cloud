"use client"

import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/confirm-dialog"
import type { DesignImage } from "@/lib/types"

export function ImageSlot({
  index,
  image,
  onUpload,
  onRemove,
  onReplace,
}: {
  index: number
  image?: DesignImage
  onUpload: (file: File) => void
  onRemove: () => void
  onReplace: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return
    image ? onReplace(file) : onUpload(file)
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
    event.target.value = ""
  }
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }
  return <div onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`grid min-h-48 gap-3 rounded-lg border-2 border-dashed p-3 text-center ${dragging ? "border-primary bg-primary/5" : "border-border"}`}>
    <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
    {image ? <><img src={image.url} alt={`Image ${index + 1}`} className="aspect-video w-full rounded object-cover" /><span className="text-xs text-muted-foreground">Image {index + 1}{index === 0 ? " · Primary" : ""}</span><div className="flex justify-center gap-2"><Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}><RefreshCw data-icon="inline-start" />Replace</Button><ConfirmButton title="Remove this image?" description="This image will be removed from the design." onConfirm={onRemove}><Trash2 className="size-4" /></ConfirmButton></div></> : <><div className="grid place-items-center gap-2 py-5"><ImagePlus className="size-6 text-muted-foreground" /><span className="text-sm">Image {index + 1}</span><Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>Click to upload</Button><span className="text-xs text-muted-foreground">or drag and drop</span></div></>}
  </div>
}