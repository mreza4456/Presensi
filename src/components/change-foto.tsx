"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { deleteLogo, uploadLogo, updateOrganization } from "@/action/organization"

interface ProfilePhotoDialogProps {
    organizationId?: string
    currentLogo?: string | null  // ⬅️ tambahkan | null
    onChange?: (newLogo: string | null) => void
}


export default function ProfilePhotoDialog({ organizationId, currentLogo, onChange }: ProfilePhotoDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!organizationId) return
        setLoading(true)
        try {
            let newLogo = currentLogo

            if (selectedFile) {
                // Upload logo baru
                const uploaded = await uploadLogo(selectedFile)
                if (uploaded) {
                    // Hapus logo lama
                    if (currentLogo) await deleteLogo(currentLogo)
                    newLogo = uploaded
                }
            }

            // Update di DB
            await updateOrganization(organizationId, { logo_url: newLogo })
            onChange?.(newLogo ?? null)
            toast.success("Logo updated!")
        } catch (err) {
            toast.error("Gagal update logo")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!organizationId || !currentLogo) return
        setLoading(true)
        try {
            await deleteLogo(currentLogo)
            await updateOrganization(organizationId, { logo_url: null })
            setSelectedFile(null)
            onChange?.(null)
            toast.success("Logo deleted!")
        } catch {
            toast.error("Gagal hapus logo")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Change Logo</Button>
            </DialogTrigger>
            <DialogContent className=" max-w-md w-full bg-white p-6 rounded-lg shadow-lg z-50">
                <DialogTitle>Logo</DialogTitle>
                <DialogDescription>Update your Logo below.</DialogDescription>

                <div className="flex flex-col items-center gap-4 mt-4">
                    {(selectedFile || currentLogo) && (
                        <img
                            src={selectedFile ? URL.createObjectURL(selectedFile) : currentLogo!}
                            alt="Preview"
                            className="object-cover border "
                        />
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />

                    <div className=" flex justify-end gap-2 w-full">
                        {(currentLogo || selectedFile) && (
                            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                                Delete
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={loading}>
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
