"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/head"

export default function Loading() {
    return (
        <>
            <title>LLMHub</title>
            <PageHeader title={"Home"} loading={true} />
            <div className="w-full h-full min-h-[200px] p-6 max-w-7xl md:p-10 m-auto">
                <div className="flex flex-col gap-6 w-full max-w-md">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
            </div>
        </>
    )
} 