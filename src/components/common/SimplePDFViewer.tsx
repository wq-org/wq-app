interface SimplePDFViewerProps {
    pdfUrl: string;
    fileName?: string;
}

export default function SimplePDFViewer({
    pdfUrl,
    fileName = 'document.pdf',
}: SimplePDFViewerProps) {
    return (
        <div className="w-full h-screen">
            <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={fileName}
            />
        </div>
    );
}

