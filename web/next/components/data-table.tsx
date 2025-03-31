"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
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

interface DataTableProps<T> {
    columns: any[];
    data: T[];
    onFetch: (page: number, keyword: string) => Promise<void>;
    onCreate?: () => void;
    onCreateLabel?: string;
    onDelete?: (item: T) => Promise<void>;
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    itemToDelete: T | null;
    setItemToDelete: (item: T | null) => void;
    initialPage?: number;
    initialKeyword?: string;
}

export function DataTable<T>({
    columns,
    data,
    onFetch,
    onCreate,
    onCreateLabel = "New",
    onDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    setItemToDelete,
    initialPage = 0,
    initialKeyword = ""
}: DataTableProps<T>) {
    const [page, setPage] = useState(initialPage);
    const [keyword, setKeyword] = useState(initialKeyword);

    useEffect(() => {
        onFetch(page, keyword);
    }, [page, keyword]);

    const confirmDelete = async () => {
        if (!itemToDelete || !onDelete) return;

        await onDelete(itemToDelete);

        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <>
            <div className="max-w-7xl h-full w-full p-6 md:p-10 m-auto">
                <div className="flex items-center py-4 justify-between">
                    <div className="flex space-x-2">
                        {onCreate && (
                            <Button variant="default" size="sm" onClick={onCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                {onCreateLabel}
                            </Button>
                        )}
                    </div>
                    <Input
                        placeholder="Filter..."
                        className="max-w-sm"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onFetch(page, keyword);
                            }
                        }}
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Total {table.getFilteredRowModel().rows.length} row(s).
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                table.previousPage();
                                setPage(prevPage => Math.max(0, prevPage - 1));
                            }}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                table.nextPage();
                                setPage(prevPage => prevPage + 1);
                            }}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {onDelete && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent className="fixed z-50">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the item "{itemToDelete && typeof itemToDelete === 'object' && 'name' in itemToDelete
                                    ? String(itemToDelete['name'])
                                    : ''}"?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={confirmDelete}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
} 