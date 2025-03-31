"use client"
import PageHeader from "@/components/head";
import { DataTable } from "./data-table";

export default function TokenPage() {
    return (
        <>
            <title>Token - LLMHub</title>
            <PageHeader title={"Token"} loading={false} />
            <DataTable />
        </>
    )
}
