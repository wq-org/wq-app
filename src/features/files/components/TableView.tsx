import { useState } from 'react';
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    File,
    FileText,
    FileSpreadsheet,
    FileBarChart2,
    Ellipsis,
} from 'lucide-react';
import TableEmptyView from '@/features/files/components/TableEmptyView';
import type {FileItem} from '../types/files.types';

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

interface FileTableProps {
    files: FileItem[];
}
export default function FileTable({ files }: FileTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(files.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFiles = files.slice(startIndex, endIndex);

    const handleEdit = (fileId: number) => {
        console.log('Edit clicked for file:', fileId);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (files.length === 0) {
        return <TableEmptyView />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-6">
            <div className="w-full bg-white rounded-4xl shadow p-6">
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
                        {currentFiles.map((file) => {
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
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(Math.max(1, currentPage - 1))
                                }
                                className={
                                    currentPage === 1
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                        {getPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                                {page === 'ellipsis' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        onClick={() => handlePageChange(page as number)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                className={
                                    currentPage === totalPages
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
