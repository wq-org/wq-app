import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectItem,
    SelectContent,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Container from '@/components/common/Container';

const FEEDBACK_TYPES = [
    { value: 'feedback', label: 'Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
];

export default function CommandFeedbackForm() {
    const [type, setType] = useState<string>('feedback');
    const [message, setMessage] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call or event here
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Alert variant="default" className="w-full max-w-md mx-auto mt-8">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <AlertTitle>Thank you!</AlertTitle>
                <AlertDescription>
                    Your feedback has been submitted successfully.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Container className="px-0">
            <Card className="w-full shadow-none border-0 px-0 py-0">
                <ScrollArea className="h-80">
                    <CardHeader>
                        <h2 className="text-xl  flex items-center gap-2">
                            <MessageSquare className="h-6 w-6 " /> Send Feedback
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="feedback-type">Type</Label>
                                <Select
                                    value={type}
                                    onValueChange={setType}
                                    name="type"
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FEEDBACK_TYPES.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="feedback-message">
                                    Message
                                </Label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    id="feedback-message"
                                    placeholder="Describe your feedback, bug, or idea..."
                                    required
                                    rows={4}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!message.trim()}
                            >
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </ScrollArea>
            </Card>
        </Container>
    );
}
