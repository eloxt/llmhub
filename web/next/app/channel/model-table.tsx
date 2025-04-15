"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import { Model, ModelConfig } from "./types"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, Row, Table as ReactTable, ColumnResizeMode } from "@tanstack/react-table"
import { ImportModelTable } from "./import-model-table"

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
    // If we're in import view, render the ImportModelTable component
    if (isImportView) {
        return (
            <ImportModelTable 
                models={models}
                selectedModels={selectedModels}
                onSelect={onSelect!}
            />
        );
    }

    // Regular edit view columns
    const columns: ColumnDef<Model>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return (
                    <Input 
                        value={row.original.name}
                        onChange={(e) => onUpdate?.(index, "name", e.target.value)}
                        placeholder="Model name"
                    />
                );
            },
        },
        {
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
        },
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
        {
            id: 'prompt',
            header: 'Prompt',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return (
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
            id: 'input_cache_read',
            header: 'Input Cache Read',
            enableResizing: true,
            cell: ({ row, table }: { row: Row<Model>, table: ReactTable<Model> }) => {
                const index = table.getRowModel().rows.findIndex((r: Row<Model>) => r.id === row.id);
                return (
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
                return (
                    <Input 
                        type="number"
                        value={(row.original.config.completion * 1000000).toFixed(2)}
                        onChange={(e) => onUpdateConfig?.(index, "completion", parseFloat(e.target.value) / 1000000)}
                        placeholder="0.00"
                    />
                );
            },
        },
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
                                No models added. Click "Add Model" to add one.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 