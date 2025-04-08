"use client"

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Pencil, Plus, Minus } from "lucide-react";
import { Channel } from "./types";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ColumnsProps {
    onEdit: (channel: Channel) => void;
    onDelete?: (channel: Channel) => void;
    handleChannelUpdate: (channel: Channel) => void;
}


export const createColumns = ({ onEdit, onDelete, handleChannelUpdate }: ColumnsProps): ColumnDef<Channel>[] => [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        enableResizing: true,
        maxSize: 20,
        cell: ({ row }) => {
            return (
                <Switch
                    checked={row.original.status === 1}
                    onCheckedChange={(checked) => {
                        const updatedChannel = { ...row.original, status: checked ? 1 : 2 };
                        handleChannelUpdate(updatedChannel);
                    }}
                />
            )
        }
    },
    {
        accessorKey: "usedQuota",
        header: "Used Quota",
        cell: ({ row }) => {
            return (
                "$" + (row.original.usedQuota ? row.original.usedQuota.toFixed(2) : "0.00")
            )
        }
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => {
                            const updatedChannel = { ...row.original, priority: row.original.priority - 1 };
                            handleChannelUpdate(updatedChannel);
                        }}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="inline-flex items-center justify-center w-8">{row.original.priority}</span>
                    <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => {
                            const updatedChannel = { ...row.original, priority: row.original.priority + 1 };
                            handleChannelUpdate(updatedChannel);
                        }}
                    >
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
            )
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const channel = row.original
            return (
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEdit(channel)}
                    >
                        <Pencil className="h-4 w-4 mr-1" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm" 
                        className="text-red-600"
                        onClick={onDelete ? () => onDelete(channel) : undefined}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                    </Button>
                </div>
            )
        }
    }
]

