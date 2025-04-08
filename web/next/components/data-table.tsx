"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
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
    total?: number;
    pageSize?: number;
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
    initialKeyword = "",
    total = 0,
    pageSize = 10
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
                                            <TableHead key={header.id} className="font-semibold">
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
                                table.getRowModel().rows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        className={index % 2 === 0 ? "bg-gray-50" : ""}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-14">
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
                        Total {total} row(s).
                    </div>
                <div className="flex items-center space-x-2">
                <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        page > 0 && setPage(page - 1);
                                    }}
                                    aria-disabled={page === 0}
                                    className={cn(
                                        "cursor-pointer",
                                        page === 0 && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                            {(() => {
                                const totalPages = Math.ceil(total / pageSize);
                                const currentPage = page + 1;
                                const pages = [];

                                // Always show first page
                                pages.push(
                                    <PaginationItem key={1}>
                                        <PaginationLink 
                                            href="#" 
                                            isActive={currentPage === 1}
                                            onClick={() => setPage(0)}
                                            className="cursor-pointer"
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                );

                                let startPage = Math.max(2, currentPage - 1);
                                let endPage = Math.min(totalPages - 1, currentPage + 1);

                                // Adjust when near the beginning
                                if (currentPage <= 2) {
                                    startPage = 2;
                                    endPage = Math.min(4, totalPages - 1);
                                }

                                // Adjust when near the end
                                if (currentPage >= totalPages - 2) {
                                    startPage = Math.max(totalPages - 3, 2);
                                    endPage = totalPages - 1;
                                }

                                // Add ellipsis after first page if needed
                                if (startPage > 2) {
                                    pages.push(
                                        <PaginationItem key="ellipsis1">
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                // Add middle pages
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <PaginationItem key={i}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === i}
                                                onClick={() => setPage(i - 1)}
                                                className="cursor-pointer"
                                            >
                                                {i}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }

                                // Add ellipsis before last page if needed
                                if (endPage < totalPages - 1) {
                                    pages.push(
                                        <PaginationItem key="ellipsis2">
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                // Always show last page if there is more than one page
                                if (totalPages > 1) {
                                    pages.push(
                                        <PaginationItem key={totalPages}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === totalPages}
                                                onClick={() => setPage(totalPages - 1)}
                                                className="cursor-pointer"
                                            >
                                                {totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }

                                return pages;
                            })()} 
                            <PaginationItem>
                                <PaginationNext 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        page < Math.ceil(total / pageSize) - 1 && setPage(page + 1);
                                    }}
                                    aria-disabled={page >= Math.ceil(total / pageSize) - 1}
                                    className={cn(
                                        "cursor-pointer",
                                        page >= Math.ceil(total / pageSize) - 1 && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
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