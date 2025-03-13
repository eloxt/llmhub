"use client"

import PageHeader from "@/components/head";
import { DataTable } from "./data-table";
import { Channel, createColumns } from "./colums";
import { EditDialog } from "./edit-dialog";
import { useState } from "react";

export default function ChannelPage() {
    const [editingChannel, setEditingChannel] = useState<Channel | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const data: Channel[] = [
        {
            id: "1",
            type: 1,
            status: 1,
            name: "OpenRouter",
            createdTime: "2021-01-01",
            testTime: "2021-01-01",
            responseTime: 100,
            baseUrl: "https://example.com",
            models: "model1, model2",
            usedQuota: 100,
            modelMapping: "model1, model2",
            priority: 1,
            config: "config",
            systemPrompt: "systemPrompt",
        },
        {
            id: "2",
            type: 2,
            status: 2,
            name: "Anthropic",
            createdTime: "2021-01-01",
            testTime: "2021-01-01",
            responseTime: 100,
            baseUrl: "https://example.com",
            models: "model1, model2",
            usedQuota: 100,
            modelMapping: "model1, model2",
            priority: 1,
            config: "config",
            systemPrompt: "systemPrompt",
        }
    ]

    const handleEdit = (channel: Channel) => {
        setEditingChannel(channel);
        setIsDialogOpen(true);
    };

    const handleSave = (channel: Channel) => {
        // TODO: Implement save functionality
        console.log('Saving channel:', channel);
        setIsDialogOpen(false);
    };

    const columns = createColumns({
        onEdit: handleEdit,
    });

    return (
        <>
            <title>Channel - LLMHub</title>
            <PageHeader title={"Channel"} />
            <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                <DataTable columns={columns} data={data} />
            </div>
            <EditDialog
                channel={editingChannel}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
            />
        </>
    )
}
