import { Button } from "@/components/ui/button";
import { Token } from "./types";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ColumnsProps {
    onEdit: (token: Token) => void;
    onDelete?: (token: Token) => void;
    handleTokenUpdate: (token: Token) => void;
}

export const createColumns = ({ onEdit, onDelete, handleTokenUpdate }: ColumnsProps): ColumnDef<Token>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "used_quota",
        header: "Used Quota",
        cell: ({ row }) => {
            const usedQuota = row.original.used_quota;
            return usedQuota ? "$" + usedQuota.toFixed(2) : "$0.00";
        }
    },
    {
        accessorKey: "remain_quota",
        header: "Remain Quota",
        cell: ({ row }) => {
            const remainQuota = row.original.remain_quota;
            return remainQuota ? "$" + remainQuota.toFixed(2) : "$0.00";
        }
    },
    {
        accessorKey: "accessed_time",
        header: "Accessed At",
        cell: ({ row }) => {
            const accessedTime = row.original.accessed_time;
            if (!accessedTime) return "N/A";
            return new Date(accessedTime).toLocaleString('zh-CN', {
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return (
                <Switch
                    checked={row.original.status === 1}
                    onCheckedChange={(checked) => {
                        const updatedToken = { ...row.original, status: checked ? 1 : 2 };
                        handleTokenUpdate(updatedToken);
                    }}
                />
            )
        }
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const token = row.original;
            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText("sk-" + token.key)
                        toast.success("Token copied to clipboard")
                    }}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(token)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete ? onDelete(token) : undefined}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )
        }
    }
]
