import { useState } from 'react';
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
import TableEmptyView from '@/features/files/components/TableEmptyView';
import type {FileItem} from '../types/files.types';
import {FILE_TYPE_CONFIG} from '../types/files.types';
import FilesCard from './FilesCard';

interface FileTableProps {
    files: FileItem[];
    onRefresh?: () => void;
}
export default function FileTable({ files, onRefresh }: FileTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(files.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFiles = files.slice(startIndex, endIndex);

    const handleRowClick = (file: FileItem) => {
        setSelectedFile(file);
        setIsDrawerOpen(true);
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
                                Size
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentFiles.map((file) => {
                            const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.PDF;
                            const Icon = config.Icon;
                            return (
                                <TableRow
                                    key={file.id}
                                    className="border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleRowClick(file)}
                                >
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex items-center gap-3 h-10 min-h-[40px]">
                                            {file.filename}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {file.size}
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
            
            {/* FilesCard Drawer */}
            {selectedFile && (
                <FilesCard
                    file={selectedFile}
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    onFileDeleted={() => {
                        setIsDrawerOpen(false);
                        setSelectedFile(null);
                        // Refresh files list after deletion
                        if (onRefresh) {
                            onRefresh();
                        }
                    }}
                />
            )}
        </div>
    );
}
