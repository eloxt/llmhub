"use client"

import PageHeader from "@/components/head"
import { DataTable } from "./data-table"

export default function LogPage() {
    return (
        <>
            <title>Log - LLMHub</title>
            <PageHeader title={"Log"} loading={false} />
            <DataTable />
        </>
    )
}
