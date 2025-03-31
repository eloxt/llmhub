"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { Model, ModelConfig } from "./types"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, Row, Table as ReactTable, ColumnResizeMode } from "@tanstack/react-table"

export interface ModelTableProps {
    isImportView?: boolean;
    models: Model[];
    selectedModels?: Set<number>;
    onSelect?: (id: number) => void;
    onUpdate?: (index: number, field: keyof Model, value: any) => void;
    onUpdateConfig?: (index: number, field: keyof ModelConfig, value: any) => void;
    onRemove?: (index: number) => void;
}

export function ModelTable({ 
    isImportView = false, 
    models, 
    selectedModels = new Set(),
    onSelect, 
    onUpdate, 
    onUpdateConfig, 
    onRemove 
}: ModelTableProps) {
    const columns: ColumnDef<Model>[] = [
        ...(isImportView ? [
            {
                id: 'select',
                cell: ({ row }: { row: Row<Model> }) => (
                    <Checkbox
                        checked={selectedModels.has(row.original.id)}
                        onCheckedChange={() => onSelect?.(row.original.id)}
                    />
                ),
                size: 50,
                enableResizing: true,
            },
        ] : []),
        {
            accessorKey: 'name',
            header: 'Name',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return isImportView ? (
                    row.original.name
                ) : (
                    <Input 
                        value={row.original.name}
                        onChange={(e) => onUpdate?.(index, "name", e.target.value)}
                        placeholder="Model name"
                    />
                );
            },
        },
        ...(!isImportView ? [{
            accessorKey: 'mapped_name',
            header: 'Mapped Name',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return (
                    <Input 
                        value={row.original.mapped_name}
                        onChange={(e) => onUpdate?.(index, "mapped_name", e.target.value)}
                        placeholder="Mapped name"
                    />
                );
            },
        }] : []),
        ...(!isImportView ? [
            {
                id: 'enabled',
                header: 'Enable',
                enableResizing: true,
                cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                    const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                    return (
                        <Switch
                            checked={row.original.enabled}
                            onCheckedChange={(checked) => onUpdate?.(index, "enabled", checked)}
                        />
                    );
                },
                size: 52,
            },
        ] : []),
        {
            id: isImportView ? 'context_length' : 'prompt',
            header: isImportView ? 'Context Length' : 'Prompt',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return isImportView ? (
                    row.original.config.context_length
                ) : (
                    <Input 
                        type="number"
                        value={(row.original.config.prompt * 1000000).toFixed(2)}
                        onChange={(e) => onUpdateConfig?.(index, "prompt", parseFloat(e.target.value) / 1000000)}
                        placeholder="0.00"
                    />
                );
            },
        },
        {
            id: isImportView ? 'prompt_cost' : 'input_cache_read',
            header: isImportView ? 'Prompt Cost' : 'Input Cache Read',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return isImportView ? (
                    "$" + (row.original.config.prompt * 1000000).toFixed(2)
                ) : (
                    <Input 
                        type="number"
                        value={(row.original.config.input_cache_read * 1000000).toFixed(2)}
                        onChange={(e) => onUpdateConfig?.(index, "input_cache_read", parseFloat(e.target.value) / 1000000)}
                        placeholder="0.00"
                    />
                );
            },
        },
        {
            accessorKey: 'completion_cost',
            header: 'Completion Cost',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return isImportView ? (
                    "$" + (row.original.config.completion * 1000000).toFixed(2)
                ) : (
                    <Input 
                        type="number"
                        value={(row.original.config.completion * 1000000).toFixed(2)}
                        onChange={(e) => onUpdateConfig?.(index, "completion", parseFloat(e.target.value) / 1000000)}
                        placeholder="0.00"
                    />
                );
            },
        },
        ...(!isImportView ? [
            {
                id: 'actions',
                cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                    const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                    return (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onRemove?.(index)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    );
                },
                size: 52,
            },
        ] : []),
    ];

    const table = useReactTable({
        data: models,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange" as ColumnResizeMode,
        enableColumnResizing: true,
    });

    return (
        <div className="border rounded-md w-full">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead 
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    className="relative"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${
                                            header.column.getIsResizing() ? 'bg-primary' : ''
                                        }`}
                                    />
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell 
                                        key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-6">
                                {isImportView 
                                    ? "No models available to import." 
                                    : "No models added. Click \"Add Model\" to add one."}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 