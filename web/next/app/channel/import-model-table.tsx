"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Model } from "./types"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, Row, Table as ReactTable, ColumnResizeMode } from "@tanstack/react-table"

export interface ImportModelTableProps {
    models: Model[];
    selectedModels: Set<number>;
    onSelect: (id: number) => void;
}

export function ImportModelTable({ 
    models, 
    selectedModels = new Set(),
    onSelect
}: ImportModelTableProps) {
    const columns: ColumnDef<Model>[] = [
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
        {
            accessorKey: 'name',
            header: 'Name',
            enableResizing: true,
            cell: ({ row }: { row: Row<Model> }) => row.original.name,
        },
        {
            id: 'context_length',
            header: 'Context Length',
            enableResizing: true,
            cell: ({ row }: { row: Row<Model> }) => row.original.config.context_length,
        },
        {
            id: 'prompt_cost',
            header: 'Prompt Cost',
            enableResizing: true,
            cell: ({ row }: { row: Row<Model> }) => "$" + (row.original.config.prompt * 1000000).toFixed(2),
        },
        {
            accessorKey: 'completion_cost',
            header: 'Completion Cost',
            enableResizing: true,
            cell: ({ row }: { row: Row<Model> }) => "$" + (row.original.config.completion * 1000000).toFixed(2),
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
                                No models available to import.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
