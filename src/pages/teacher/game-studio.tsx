import AppWrapper from '@/components/layout/AppWrapper';

export default function GameStudio() {
    return (
        <>
            <AppWrapper role="teacher">
                <h1 className="text-6xl">Game Studio Page</h1>
                <p className="text-gray-500 mt-2">
                    This is the platform where teachers can create and manage educational games for their students.
                </p>
            </AppWrapper>
        </>
    );
}
