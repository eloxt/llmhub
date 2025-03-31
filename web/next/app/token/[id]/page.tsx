"use client"

import PageHeader from "@/components/head";
import { TokenForm } from "../token-form";
import { Token } from "../types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/app/loading";
import { fetchApi } from "@/lib/api";

export default function EditTokenPage() {
    const params = useParams();
    const [token, setToken] = useState<Token | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const response = await fetchApi<Token>(`/api/token/${params.id}`);
            if (response.success) {
                setToken(response.data);
            }
        };

        fetchToken();
    }, [params.id]);

    return (
        <>
            {token ? (
                <>
                    <title>Edit Token - LLMHub</title>
                    <PageHeader title="Edit Token" loading={false} />
                    <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                        <TokenForm initialData={token} isEdit={true} />
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </>
    )
} 