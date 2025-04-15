"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Log } from "./types"
import { Badge } from "@/components/ui/badge"

export const createColumns = () => {
    const columns: ColumnDef<Log>[] = [
        {
            accessorKey: "created_at",
            header: "Create Time",
            cell: ({ row }) => {
                const createdAt = row.original.created_at;
                return new Date(createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
            }
        },
        {
            accessorKey: "channel",
            header: "Channel",
        },
        {
            accessorKey: "model_name",
            header: "Model",
            cell: ({ row }) => {
                return (
                    <Badge>{row.original.model_name}</Badge>
                )
            }
        },
        {
            accessorKey: "token_name",
            header: "Token",
        },
        {
            accessorKey: "prompt_tokens",
            header: "Prompt Tokens",
        },
        {
            accessorKey: "completion_tokens",
            header: "Completion Tokens",
        },
        {
            accessorKey: "quota",
            header: "Quota",
            cell: ({ row }) => {
                const quota = row.original.quota;
                return quota ? "$" + quota.toFixed(7) : "$0.00";
            }
        },
        {
            accessorKey: "content",
            header: "Content",
        },
    ]

    return columns
}
