"use client"

import PageHeader from "@/components/head";
import { ChannelForm } from "../channel-form";

export default function NewChannelPage() {
    return (
        <>
            <title>New Channel - LLMHub</title>
            <PageHeader title="New Channel" loading={false} />
            <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                <ChannelForm />
            </div>
        </>
    )
} 