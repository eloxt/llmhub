"use client"
import PageHeader from "@/components/head";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Model } from "./channel/types";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/api";

export default function Home() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetchApi<Model[]>('/api/models');
                setModels(response.data);
            } catch (error) {
                console.error('Error fetching models:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    return (
        <>
            <title>Home - LLMHub</title>
            <PageHeader title={"Home"} loading={loading} />
            <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto ">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Model</TableHead>
                            <TableHead className="font-semibold">Input (Per 1M Tokens)</TableHead>
                            <TableHead className="font-semibold">Output (Per 1M Tokens)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : models.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No models found</TableCell>
                            </TableRow>
                        ) : (
                            models.map((model) => (
                                <TableRow key={model.id} className="h-14">
                                    <TableCell className="whitespace-normal">{model.name}</TableCell>
                                    <TableCell className="whitespace-normal">${(model.config.prompt * 1000000).toFixed(2)}</TableCell>
                                    <TableCell className="whitespace-normal">${(model.config.completion * 1000000).toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
