"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table"

export type Channel = {
    id: string;
    type: number;
    status: number;
    name: string;
    createdTime: string;
    testTime: string;
    responseTime: number;
    baseUrl: string;
    models: string;
    usedQuota: number;
    modelMapping: string;
    priority: number;
    config: string;
    systemPrompt: string;
}

interface ColumnsProps {
    onEdit: (channel: Channel) => void;
}

export const createColumns = ({ onEdit }: ColumnsProps): ColumnDef<Channel>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return (
                <Badge variant={row.original.status === 1 ? "default" : "secondary"}>
                    {row.original.status === 1 ? "Enabled" : "Disabled"}
                </Badge>
            )
        }
    },
    {
        accessorKey: "usedQuota",
        header: "Used Quota",
        cell: ({ row }) => {
            return (
                "$" + row.original.usedQuota.toFixed(6)
            )
        }
    },
    {
        accessorKey: "priority",
        header: "Priority",
    },
    {
        id: "actions",
        header: "Actions",
        minSize: 100,
        cell: ({ row }) => {
            const channel = row.original
            return <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(channel)}>Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
            </div>
        }
    }
]
