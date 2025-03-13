import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";

export default function PageHeader({title}: { title: String }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 h-4!"/>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        </header>
    )
}