// import { useMemo, useState } from 'react';
// import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
// import type { YooptaContentValue } from '@yoopta/editor';
// import Paragraph from '@yoopta/paragraph';
// import { HeadingOne } from '@yoopta/headings';
import AppWrapper from '@/components/layout/AppWrapper';
import { Separator } from '@/components/ui/separator';
import { useParams, useLocation } from 'react-router-dom';

// const plugins = [Paragraph, HeadingOne];

export default function Lesson() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const lessonTitle = (location.state as { title?: string })?.title || "What's your Page about?";

    // const editor = useMemo(() => createYooptaEditor(), []);
    // const [value, setValue] = useState<YooptaContentValue | undefined>(undefined);

    return (
        <AppWrapper role="teacher" className="flex flex-col gap-12">
            <div className="max-w-4xl mt-4 flex flex-col mx-auto">
                <h1
                    className="px-4 text-6xl font-light mb-2 outline-none focus:ring-2 focus:ring-primary/30 transition leading-[1.2] rounded-lg"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={true}
                    tabIndex={0}
                >
                    {lessonTitle}
                </h1>
                <p
                    className="px-4 text-2xl text-gray-400 font-light mt-2 outline-none focus:ring-2 focus:ring-primary/20 transition max-w-[28rem] rounded-lg"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={true}
                    tabIndex={0}
                >
                    Description about the page
                </p>
            </div>
            <Separator />
            <div className="flex-1 flex w-full">
                {/* <YooptaEditor
                    className="w-full max-w-4xl mx-auto flex-1"
                    editor={editor}
                    plugins={plugins}
                    value={value}
                    autoFocus={true}
                    onChange={(newValue) => setValue(newValue)}
                    placeholder="Start writing..."
                /> */}
            </div>
        </AppWrapper>
    );
}

