"use client"

import PageHeader from "@/components/head";
import { DataTable } from "./data-table";

export default function ChannelPage() {
    return (
        <>
            <title>Channel - LLMHub</title>
            <PageHeader title={"Channel"} loading={false} />
            <DataTable />
        </>
    )
}
