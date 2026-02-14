'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { uploadImage, getImagePath } from '@/lib/firebase/storage'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  className?: string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'images',
  className,
  placeholder = 'Upload an image or paste a URL',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB')
        return
      }

      setError('')
      setUploading(true)
      try {
        const path = getImagePath(folder, file.name)
        const url = await uploadImage(file, path)
        onChange(url)
      } catch {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [folder, onChange]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleClear = () => {
    onChange('')
    setError('')
  }

  // If there's a value, show preview
  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="400px"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          ref={urlInputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full text-xs text-muted-foreground bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Image URL"
        />
      </div>
    )
  }

  // Empty state — upload zone
  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* URL paste fallback */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-muted-foreground">or paste URL</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          onChange={(e) => {
            if (e.target.value.trim()) onChange(e.target.value.trim())
          }}
          className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          placeholder={placeholder}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
