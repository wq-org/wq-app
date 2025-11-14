import * as Dialog from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar';
import { X, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants';
import { useSearchItems, type SearchItem } from '../hooks';

export default function CommandSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const { items, loading } = useSearchItems();

    const filtered = useMemo(() => {
        const currentSearchQuery = searchQuery.trim().toLowerCase();
        if (!currentSearchQuery) return items;
        
        return items.filter((item) => {
            const emailMatch = item.email?.toLowerCase().includes(currentSearchQuery) || false;
            const usernameMatch = item.username?.toLowerCase().includes(currentSearchQuery) || false;
            const titleMatch = item.title.toLowerCase().includes(currentSearchQuery);
            
            return emailMatch || usernameMatch || titleMatch;
        });
    }, [searchQuery, items]);

    const handleClickItem = (item: SearchItem) => {
        console.log('Email:', item.email);
        console.log('Username:', item.username);
        // Add your logic here, e.g., navigate to user profile or execute a command
    };

    return (
        <>
            <div className="flex items-center border-b px-4 py-3">
                <Search className="mr-3 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Type a command or search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    autoFocus
                />
                <Dialog.Close asChild>
                    <Button
                        size={'icon'}
                        variant={'ghost'}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Dialog.Close>
            </div>

            {/* Results area stretches to fill available height */}
            <div className="flex-1 ">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Loading...
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="p-2 max-h-80 overflow-y-auto">
                        {filtered.map((item) => (
                            <Card
                                onClick={() => handleClickItem(item)}
                                key={`${item.type}-${item.id}`}
                                className="border-0 rounded-2xl shadow-none w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer"
                            >
                                <div className="flex gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage
                                            src={item.avatar_url || AVATAR_PLACEHOLDER_SRC}
                                            alt={item.title}
                                            className="rounded-full w-12 h-12"
                                        />
                                        <AvatarFallback className="text-xl rounded-full w-12 h-12 flex items-center justify-center bg-gray-200">
                                            {item.title.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {item.title}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {item.email || 'No email'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No results found
                    </div>
                )}
            </div>
            <Dialog.Description className="sr-only">
                Search and execute commands quickly
            </Dialog.Description>
        </>
    );
}
