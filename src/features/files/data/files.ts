export interface FileItem {
    id: number;
    filename: string;
    description: string;
    type: 'Word' | 'PPT' | 'Exl' | 'PDF';
    size: string;
}

export const files: FileItem[] = [
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
