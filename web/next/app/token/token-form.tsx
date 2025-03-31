"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Token } from "./types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

interface TokenFormProps {
    initialData?: Token
    isEdit?: boolean
}

export function TokenForm({ initialData, isEdit = false }: TokenFormProps) {
    const router = useRouter()
    
    const [formData, setFormData] = useState<Partial<Token>>(initialData ? initialData : {
        name: "",
        key: "",
        status: 1,
        remain_quota: 0,
        unlimited_quota: false,
        used_quota: 0
    });
    
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await fetchApi<Token>('/api/token', {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
                showSuccessToast: true
            });

            if (response.success) {
                router.push('/token')
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving token:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="remain_quota">Remaining Quota</Label>
                <Input
                    id="remain_quota"
                    type="number"
                    value={String(formData.remain_quota || 0)}
                    onChange={(e) => setFormData({ ...formData, remain_quota: parseInt(e.target.value) })}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="unlimited_quota"
                    checked={formData.unlimited_quota}
                    onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        unlimited_quota: checked
                    })}
                />
                <Label htmlFor="unlimited_quota">Unlimited Quota</Label>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="status"
                    checked={formData.status === 1}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 2 })}
                />
                <Label htmlFor="status">Enabled</Label>
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/token')}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    )
} 