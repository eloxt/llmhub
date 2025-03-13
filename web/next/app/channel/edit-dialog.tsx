"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Channel } from "./colums"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface EditDialogProps {
    channel?: Channel
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (channel: Channel) => void
}

export function EditDialog({
    channel,
    open,
    onOpenChange,
    onSave,
}: EditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{channel ? 'Edit Channel' : 'New Channel'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            defaultValue={channel?.name}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select defaultValue={channel?.type.toString()}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">OpenRouter</SelectItem>
                                <SelectItem value="2">Anthropic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select defaultValue={channel?.status.toString()}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Enabled</SelectItem>
                                <SelectItem value="2">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="baseUrl" className="text-right">
                            Base URL
                        </Label>
                        <Input
                            id="baseUrl"
                            defaultValue={channel?.baseUrl}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                            Priority
                        </Label>
                        <Input
                            id="priority"
                            type="number"
                            defaultValue={channel?.priority}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="config" className="text-right">
                            Config
                        </Label>
                        <Textarea
                            id="config"
                            defaultValue={channel?.config}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="systemPrompt" className="text-right">
                            System Prompt
                        </Label>
                        <Textarea
                            id="systemPrompt"
                            defaultValue={channel?.systemPrompt}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => onSave(channel!)}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 