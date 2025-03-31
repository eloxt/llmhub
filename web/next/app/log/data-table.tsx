"use client"

import { useEffect, useState } from "react"
import { createColumns } from "./columns"
import { Log } from "./types"
import { fetchApi } from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Filters {
    token_name: string
    model_name: string
    channel: string
    start_timestamp: string
    end_timestamp: string
}

export function DataTable() {
    const [data, setData] = useState<Log[]>([])
    const [page, setPage] = useState(0)
    const [page_size, setPage_size] = useState(10)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<Filters>({
        token_name: "",
        model_name: "",
        channel: "",
        start_timestamp: "",
        end_timestamp: ""
    })

    const fetchLogs = async (page: number) => {
        setPage(page)
        const queryParams = new URLSearchParams({
            p: page.toString(),
            page_size: page_size.toString(),
            ...filters
        })
        const response = await fetchApi<Log[]>(`/api/log?${queryParams.toString()}`)
        if (response.success) {
            setData(response.data)
            setPage(response.page || 0)
            setTotal(response.total || 0)
        }
    }

    const handleFilterChange = (key: keyof Filters, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const columns = createColumns()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    useEffect(() => {
        fetchLogs(page)
    }, [page, page_size])

    return (
        <div className="max-w-7xl h-full w-full p-6 md:p-10 m-auto">
            <div className="flex items-center py-4 justify-between gap-4">
                <Input
                    placeholder="Token Name"
                    value={filters.token_name}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            fetchLogs(0)
                        }
                    }}
                    onChange={(e) => handleFilterChange('token_name', e.target.value)}
                />
                <Input
                    placeholder="Model Name"
                    value={filters.model_name}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            fetchLogs(0)
                        }
                    }}
                    onChange={(e) => handleFilterChange('model_name', e.target.value)}
                />
                <Input
                    placeholder="Channel"
                    value={filters.channel}
                    onChange={(e) => handleFilterChange('channel', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            fetchLogs(0)
                        }
                    }}
                />
                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !filters.start_timestamp && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.start_timestamp ? format(new Date(filters.start_timestamp), 'PPP') : <span>Start Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.start_timestamp ? new Date(filters.start_timestamp) : undefined}
                                onSelect={(date: Date | undefined) =>
                                    handleFilterChange('start_timestamp', date?.toISOString() || '')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !filters.end_timestamp && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.end_timestamp ? format(new Date(filters.end_timestamp), 'PPP') : <span>End Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.end_timestamp ? new Date(filters.end_timestamp) : undefined}
                                onSelect={(date: Date | undefined) =>
                                    handleFilterChange('end_timestamp', date?.toISOString() || '')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <Button onClick={() => fetchLogs(0)}>Search</Button>
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
                    Total {total} row(s). Page {page + 1} of {Math.ceil(total / page_size)}
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        value={page_size.toString()}
                        onValueChange={(value) => {
                            setPage_size(parseInt(value))
                            setPage(0)
                            table.setPageSize(parseInt(value))
                        }}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            table.previousPage();
                            setPage(prevPage => Math.max(0, prevPage - 1));
                        }}
                        disabled={page === 0}
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
                        disabled={page >= Math.ceil(total / page_size) - 1}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
