"use client"

import PageHeader from "@/components/head";
import { TokenForm } from "../token-form";

export default function NewTokenPage() {
    return (
        <>
            <title>New Token - LLMHub</title>
            <PageHeader title="New Token" loading={false} />
            <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                <TokenForm />
            </div>
        </>
    )
} 