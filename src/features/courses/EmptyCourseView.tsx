import { BookOpen } from 'lucide-react';

export default function EmptyCourseView() {
    return (
        <div className="w-full flex flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="p-3 rounded-full bg-gray-50 border border-gray-200  duration-300 delay-150">
                <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="mt-3 text-gray-500 text-center text-sm ">
                Erstelle deinen ersten Kurs
            </p>
            <p className="text-xs text-gray-400 text-center mt-1 ">
                Es ist noch kein Kurs vorhanden. Bitte klicke oben auf den Button, um mit dem Erstellen zu beginnen.
            </p>
        </div>
    );
}

