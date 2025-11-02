import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card";

const CommandAddDialog = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreate = () => {
        // Here would go your create logic or API call
        // For now, just log
        console.log("Create Course", {
            title,
            description,
        });
        setTitle("");
        setDescription("");
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
                onSubmit={e => {
                    e.preventDefault();
                    handleCreate();
                }}
            >
                <CardHeader className="items-center p-0">
                    <CardTitle className="text-xl  font-light text-muted-foreground">
                        Add New Course
                    </CardTitle>

                    <p className="text-sm text-muted-foreground mt-1 font-light">
                        Create a new course to get started.
                    </p>

                </CardHeader>

                <CardContent className="flex flex-col gap-8 w-full px-0">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="course-title" className="font-light">Course Title</Label>
                        <Input
                            id="course-title"
                            placeholder="Course Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="text-base py-2 px-3 w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="course-description" className="font-light">Course Description</Label>
                        <Textarea
                            id="course-description"
                            placeholder="Course Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="h-28 resize-none font-light w-full"
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
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={!title.trim() || !description.trim()}
                        className="w-full"
                    >
                        Create Course
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CommandAddDialog;
