import PageHeader from "@/components/head";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default function Home() {
    return (
        <>
            <title>Home - LLMHub</title>
            <PageHeader title={"Home"}/>
            <div className="flex max-w-7xl h-full w-full items-top justify-center p-6 md:p-10 m-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Model</TableHead>
                            <TableHead>Input (Per 1M Tokens)</TableHead>
                            <TableHead>Output (Per 1M Tokens)</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="whitespace-normal">gpt-4o</TableCell>
                            <TableCell className="whitespace-normal">10</TableCell>
                            <TableCell className="whitespace-normal">10</TableCell>
                            <TableCell className="whitespace-normal">GPT-4o is the latest and most powerful model from OpenAI. It is a general-purpose model that can be used for a wide range of tasks, including writing, coding, and translation.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
