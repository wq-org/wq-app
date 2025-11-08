import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { createCourse } from "@/features/courses/api/coursesApi";
import { createInstitution } from "@/features/auth/api/authApi";
import { useUser } from "@/contexts/UserContext";

// This function calls create based on type
const createByType = async (
    type: "course" | "institution",
    teacherId: string | null,
    data: { title: string; description: string },
    onSuccess?: () => void
) => {
    switch (type) {
        case "course":
            if (!teacherId) {
                throw new Error("Teacher ID is required to create a course");
            }
            const result = await createCourse(teacherId, data);
            onSuccess?.();
            return result;
        case "institution":
            return await createInstitution(data);
        default:
            throw new Error("Unknown type");
    }
};

const CommandAddDialog = ({ type, onSuccess }: { type: 'course' | 'institution'; onSuccess?: () => void }) => {
    const { profile } = useUser();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const teacherId = type === 'course' ? profile?.user_id || null : null;
            const result = await createByType(type, teacherId, { title, description }, onSuccess);
            // You might want to handle result (show notification, close dialog etc)
            console.log("Created", { type, result });
            setTitle("");
            setDescription("");
        } catch (error) {
            // Handle error (toast etc)
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setTitle("");
        setDescription("");
        // Optionally, trigger dialog close if needed
    };

    return (
        <Card className="max-w-md mx-auto border-0 shadow-none">
            <form
                className="flex flex-col gap-5"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await handleCreate();
                }}
            >
                <CardHeader className="items-center p-0">
                    <CardTitle className="text-xl text-gray-900">
                        Add New {type}
                    </CardTitle>

                    <p className="text-sm text-gray-500 mt-2 font-normal">
                        Create a new {type} to get started.
                    </p>
                </CardHeader>

                <CardContent className="flex flex-col gap-8 w-full px-0">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`${type}-title`} className="font-normal text-gray-700">{type} Title</Label>
                        <Input
                            id={`${type}-title`}
                            placeholder={`${type} Title`}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="text-base py-2 px-3 w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`${type}-description`} className="font-normal text-gray-700">{type} Description</Label>
                        <Textarea
                            id={`${type}-description`}
                            placeholder={`${type} Description`}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="h-28 resize-none w-full"
                            required
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 w-full px-0">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleCancel}
                        className="w-full"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={!title.trim() || !description.trim() || loading}
                        className="w-full"
                    >
                        {loading ? "Creating..." : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CommandAddDialog;
