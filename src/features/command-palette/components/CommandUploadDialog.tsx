import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideUpload } from 'lucide-react'; // Adjust if you use a different icon lib

export default function CommandUploadDialog() {
    return (
        <Card className="border-0 shadow-none px-0 ">
            <CardHeader className="flex flex-row items-center">
                <LucideUpload className="w-5 h-5" />
                <p className="font-regular">Upload Data</p>
            </CardHeader>
            <CardContent>
                <CardDescription className=" text-gray-600">
                    Upload your data file to get started. Supported formats:
                    PDF, image files (JPG, PNG, JPEG).
                </CardDescription>
                {/* You can add your file input here */}
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="secondary" className="flex items-center gap-1">
                    Cancel
                </Button>
                <Button variant="default" className="flex items-center gap-1">
                    Start
                </Button>
            </CardFooter>
        </Card>
    );
}
