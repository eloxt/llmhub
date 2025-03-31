"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"
import { Channel } from "./types"
import { createColumns } from "./columns"
import { toast } from "sonner"
import { DataTable as ReusableDataTable } from "@/components/data-table"

export function DataTable() {
    const router = useRouter();
    const [data, setData] = useState<Channel[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentKeyword, setCurrentKeyword] = useState("");

    const fetchChannels = async (page: number, keyword: string) => {
        setCurrentPage(page);
        setCurrentKeyword(keyword);
        const response = await fetchApi<Channel[]>(`/api/channel?p=${page}&keyword=${keyword}`);
        if (response.success) {
            setData(response.data);
        }
    };

    const handleEdit = (channel: Channel) => {
        router.push(`/channel/${channel.id}`);
    };

    const handleNew = () => {
        router.push('/channel/new');
    };

    const handleSingleDelete = (channel: Channel) => {
        setChannelToDelete(channel);
        setDeleteDialogOpen(true);
    };

    const handleChannelUpdate = async (channel: Channel) => {
        const response = await fetchApi<Channel>('/api/channel', {
            method: 'PUT',
            body: channel
        });

        if (response.success) {
            toast.success("Channel status updated successfully");
            fetchChannels(currentPage, currentKeyword);
        } else {
            toast.error("Failed to update channel status");
        }
    }

    const handleDelete = async (channel: Channel) => {
        const response = await fetchApi<Channel>(`/api/channel/${channel.id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            toast.success("Channel deleted successfully");
            fetchChannels(currentPage, currentKeyword);
        } else {
            toast.error("Failed to delete channel");
        }
    };

    const columns = createColumns({
        onEdit: handleEdit,
        onDelete: handleSingleDelete,
        handleChannelUpdate: handleChannelUpdate
    });

    return (
        <ReusableDataTable
            columns={columns}
            data={data}
            onFetch={fetchChannels}
            onCreate={handleNew}
            onCreateLabel="New"
            onDelete={handleDelete}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            itemToDelete={channelToDelete}
            setItemToDelete={setChannelToDelete}
            initialPage={currentPage}
            initialKeyword={currentKeyword}
        />
    )
}

