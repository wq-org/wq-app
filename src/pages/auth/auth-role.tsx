import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Presentation } from 'lucide-react'
import { GraduationCap } from 'lucide-react'

export default function AuthRole() {
    return (
        <div className="w-screen h-screen container justify-center items-center flex-col gap-8 flex mx-auto ">
            <h1 className="text-4xl">Start as in Which Type of Role</h1>
            <div className="flex gap-4">
                <Card className="w-[350px] cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-primary">
                    <CardHeader>
                        <GraduationCap />
                        <p className="text-3xl">I'm starting as a Student</p>
                        <CardDescription>
                            Student of an School or University
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-[350px] cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-primary">
                    <CardHeader>
                        <Presentation />
                        <p className="text-3xl">I'm starting as a Teacher</p>
                        <CardDescription>
                            Student of an School or University
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
