"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import { Token } from "./types";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { DataTable as ReusableDataTable } from "@/components/data-table";

export function DataTable() {
    const router = useRouter();
    const [data, setData] = useState<Token[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentKeyword, setCurrentKeyword] = useState("");
    const [total, setTotal] = useState(0);
    const [pageSize] = useState(10);
    
    const fetchTokens = async (page: number, keyword: string) => {
        setCurrentPage(page);
        setCurrentKeyword(keyword);
        const response = await fetchApi<Token[]>(`/api/token?p=${page}&keyword=${keyword}&page_size=${pageSize}`);
        if (response.success) {
            setData(response.data);
            setTotal(response.total || 0);
        }
    }

    const handleEdit = (token: Token) => {
        router.push(`/token/${token.id}`);
    }

    const handleNew = () => {
        router.push('/token/new');
    }

    const handleDelete = async (token: Token) => {
        const response = await fetchApi<Token>(`/api/token/${token.id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            toast.success("Token deleted successfully");
            fetchTokens(currentPage, currentKeyword);
        } else {
            toast.error("Failed to delete token");
        }
    };

    const handleUpdate = async (token: Token) => {
        const response = await fetchApi<Token>('/api/token', {
            method: 'PUT',
            body: token
        });

        if (response.success) {
            toast.success("Token updated successfully");
            fetchTokens(currentPage, currentKeyword);
        } else {
            toast.error("Failed to update token");
        }
    }

    const columns = createColumns({
        onEdit: handleEdit,
        onDelete: (token: Token) => {
            setTokenToDelete(token);
            setDeleteDialogOpen(true);
        },
        handleTokenUpdate: handleUpdate
    });

    return (
        <ReusableDataTable
            columns={columns}
            data={data}
            onFetch={fetchTokens}
            onCreate={handleNew}
            onCreateLabel="New"
            onDelete={handleDelete}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            itemToDelete={tokenToDelete}
            setItemToDelete={setTokenToDelete}
            initialPage={currentPage}
            initialKeyword={currentKeyword}
            total={total}
            pageSize={pageSize}
        />
    )
}
