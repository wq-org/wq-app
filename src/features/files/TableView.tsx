import { Button } from '@/components/ui/button';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import {
    File,
    FileText,
    FileSpreadsheet,
    FileBarChart2,
    Ellipsis,
} from 'lucide-react';

const files = [
    {
        id: 1,
        filename: 'Report.docx',
        description: 'Final report document',
        type: 'Word',
        size: '850 KB',
    },
    {
        id: 2,
        filename: 'Presentation.pptx',
        description: 'Q3 Results Slides',
        type: 'PPT',
        size: '2.4 MB',
    },
    {
        id: 3,
        filename: 'Budget.xlsx',
        description: 'Annual Budgets',
        type: 'Exl',
        size: '1.1 MB',
    },
    {
        id: 4,
        filename: 'Brochure.pdf',
        description: 'Product Brochure',
        type: 'PDF',
        size: '900 KB',
    },
];

const typeConfig = {
    Word: {
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        Icon: FileText,
    },
    PPT: {
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        Icon: FileBarChart2,
    },
    Exl: {
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        Icon: FileSpreadsheet,
    },
    PDF: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        Icon: File,
    },
};

export default function FileTable() {
    const handleEdit = (fileId: number) => {
        console.log('Edit clicked for file:', fileId);
    };

    return (
        <div className="w-full  flex items-center justify-center">
            <div className="w-full  bg-white rounded-2xl shadow p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-gray-400 font-light w-[60px]">
                                #
                            </TableHead>
                            <TableHead className="text-left text-gray-400 font-light">
                                Filename
                            </TableHead>
                            <TableHead className="text-center text-gray-400 font-light">
                                Description
                            </TableHead>
                            <TableHead className="text-center text-gray-400 font-light">
                                Type
                            </TableHead>
                            <TableHead className="text-center text-gray-400 font-light">
                                Size
                            </TableHead>
                            <TableHead className="text-center text-gray-400 font-light w-[80px]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((file) => {
                            const config =
                                typeConfig[
                                    file.type as keyof typeof typeConfig
                                ];
                            return (
                                <TableRow
                                    key={file.id}
                                    className="border-b last:border-0"
                                >
                                    <TableCell className="text-center">
                                        {file.id}
                                    </TableCell>
                                    <TableCell className="flex items-center gap-3 text-left">
                                    
                                        {file.filename}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {file.description}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded border ${config.bgColor} ${config.color} ${config.borderColor} text-xs font-medium`}
                                        >
                                            {file.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {file.size}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant={'ghost'}
                                            type="button"
                                            size="icon"
                                            onClick={() => handleEdit(file.id)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            aria-label={`Edit ${file.filename}`}
                                        >
                                            <Ellipsis className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
