import {CommandPalette} from "@/features/command-palette";
import CommandAddDialog from "@/features/command-palette/components/CommandAddDialog";


export default function Test() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <CommandAddDialog role="teacher" />
            <CommandPalette role="teacher" />
        </div>
    );
}