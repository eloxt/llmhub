"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Channel, Model, ModelConfig } from "./types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CloudDownload, Plus, Trash2 } from "lucide-react"
import { fetchApi } from "@/lib/api"
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
import { toast } from "sonner"
import { ModelTable } from "./model-table"
import { ImportModelTable } from "./import-model-table"

interface ChannelFormProps {
    initialData?: Channel
    isEdit?: boolean
}

export function ChannelForm({ initialData, isEdit = false }: ChannelFormProps) {
    const router = useRouter()
    
    const initialModels = initialData?.models || [];
    
    const [formData, setFormData] = useState<Partial<Channel>>(initialData ? initialData : {
        name: "",
        type: 0,
        key: "",
        status: 1,
        baseUrl: "",
        priority: 0,
        config: "",
        systemPrompt: ""
    });
    
    const [modelItems, setModelItems] = useState<Model[]>(initialModels);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [availableModels, setAvailableModels] = useState<Model[]>([]);
    const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const dataToSubmit = {
                ...formData,
                models: modelItems.map(model => ({
                    ...model,
                    channel_id: isEdit ? initialData?.id : 0
                }))
            };
            
            const response = await fetchApi<Channel>('/api/channel', {
                method: isEdit ? 'PUT' : 'POST',
                body: dataToSubmit,
                showSuccessToast: true
            });

            if (response.success) {
                router.push('/channel')
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving channel:', error)
        }
    }
    
    const addModelItem = () => {
        setModelItems([...modelItems, {
            id: 0,
            name: "",
            mapped_name: "",
            channel_id: 0,
            enabled: true,
            priority: 0,
            config: {
                context_length: 0,
                prompt: 0,
                completion: 0,
                input_cache_read: 0,
                input_cache_write: 0,
                reasoning: 0,
                additional: 0,
                tokenizer: ""
            }
        }]);
    };
    
    const removeModelItem = (index: number) => {
        setModelItems(modelItems.filter((_, i) => i !== index));
    };
    
    const updateModelItem = (index: number, field: keyof Model, value: any) => {
        const updatedItems = [...modelItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        setModelItems(updatedItems);
    };
    
    const updateModelConfig = (index: number, field: keyof ModelConfig, value: any) => {
        const updatedItems = [...modelItems];
        updatedItems[index] = {
            ...updatedItems[index],
            config: {
                ...updatedItems[index].config,
                [field]: value
            }
        };
        setModelItems(updatedItems);
    };

    const handleImportModels = async () => {
        if (isEdit && initialData?.id) {
            setIsLoading(true);
            try {
                const response = await fetchApi<Model[]>(`/api/channel/fetch-model?channel_id=${initialData.id}`);
                if (response.success) {
                    setAvailableModels(response.data);
                    setSelectedModels(new Set());
                    setImportDialogOpen(true);
                } else {
                    toast.error("Failed to fetch models");
                }
            } catch (error) {
                console.error('Error fetching models:', error);
                toast.error("Failed to fetch models");
            } finally {
                setIsLoading(false);
            }
        } else if (!isEdit && formData.type && formData.key) {
            setIsLoading(true);
            try {
                const response = await fetchApi<Model[]>(`/api/channel/fetch-model?channel_type=${formData.type}&key=${formData.key}&base_url=${formData.baseUrl}`);
                if (response.success) {
                    setAvailableModels(response.data);
                    setSelectedModels(new Set());
                    setImportDialogOpen(true);
                } else {
                    toast.error("Failed to fetch models");
                }
            } catch (error) {
                console.error('Error fetching models:', error);
                toast.error("Failed to fetch models");
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error(isEdit ? "Channel ID is required" : "Please fill in the channel type and key first");
        }
    };

    const handleConfirmImport = () => {
        const selectedModelItems = availableModels.filter(model => selectedModels.has(model.id));
        const processedModelItems = selectedModelItems.map(model => ({
            ...model,
            config: {
                ...model.config,
                input_cache_read: model.config.input_cache_read || model.config.prompt
            }
        }));
        setModelItems([...modelItems, ...processedModelItems]);
        setImportDialogOpen(false);
        setSelectedModels(new Set());
    };

    const toggleModelSelection = (modelId: number) => {
        const newSelected = new Set(selectedModels);
        if (newSelected.has(modelId)) {
            newSelected.delete(modelId);
        } else {
            newSelected.add(modelId);
        }
        setSelectedModels(newSelected);
    };

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
                <Label htmlFor="type">Type</Label>
                <Input
                    id="type"
                    type="number"
                    value={String(formData.type)}
                    onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    required={!isEdit}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                    <Label>Models</Label>
                    <div className="flex space-x-2">
                        <Button type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleImportModels}
                            disabled={isLoading}
                        >
                            <CloudDownload className="h-4 w-4 mr-1" /> Import from API
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addModelItem}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Model
                        </Button>
                    </div>
                </div>
                <ModelTable 
                    models={modelItems}
                    onUpdate={updateModelItem}
                    onUpdateConfig={updateModelConfig}
                    onRemove={removeModelItem}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                    id="baseUrl"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                    id="priority"
                    type="number"
                    value={String(formData.priority)}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                />
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
                    onClick={() => router.push('/channel')}
                >
                    Cancel
                </Button>
                <Button type="submit">
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>

            <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <AlertDialogContent className="!max-w-7xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Import Models</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the models you want to import from the API.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto w-full">
                        <ImportModelTable 
                            models={availableModels}
                            selectedModels={selectedModels}
                            onSelect={toggleModelSelection}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmImport}>
                            Import Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
} 