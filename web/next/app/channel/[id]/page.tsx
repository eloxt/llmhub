"use client"

import PageHeader from "@/components/head";
import { ChannelForm } from "../channel-form";
import { Channel } from "../types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/app/loading";
import { fetchApi } from "@/lib/api";

export default function EditChannelPage() {
    const params = useParams();
    const [channel, setChannel] = useState<Channel | null>(null);

    useEffect(() => {
        const fetchChannel = async () => {
            const response = await fetchApi<Channel>(`/api/channel/${params.id}`);
            if (response.success) {
                setChannel(response.data);
            }
        };

        fetchChannel();
    }, [params.id]);


    return (
        <>
            {channel ? (
                <>
                    <title>Edit Channel - LLMHub</title>
                    <PageHeader title="Edit Channel" loading={false} />
                    <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                        <ChannelForm initialData={channel} isEdit={true} />
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </>
    )
} 