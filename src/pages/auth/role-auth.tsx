import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState<string>('')
    const navigate = useNavigate()

    const handleContinue = () => {
        if (selectedRole) {
            navigate('/login', { state: { role: selectedRole } })
        }
    }

    return (
        <div className="w-screen h-screen container justify-center items-center flex-col gap-8 flex mx-auto">
            <h1 className="text-4xl">
                Join your School now{' '}
                {selectedRole && (
                    <span>
                        <span className="mr-2.5">as a</span>
                        <span className="bg-gray-100 text-black rounded-2xl px-4 py-2 capitalize">
                            {selectedRole}
                        </span>
                    </span>
                )}
            </h1>

            <RadioGroup
                className="flex gap-4"
                value={selectedRole}
                onValueChange={setSelectedRole}
            >
                <Card
                    className={`w-[350px] cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                        selectedRole === 'student'
                            ? 'border-primary shadow-lg'
                            : ''
                    }`}
                    onClick={() => setSelectedRole('student')}
                >
                    <CardHeader>
                        <div className="w-full flex justify-end">
                            <RadioGroupItem
                                value="student"
                                id="student"
                                className="w-6 h-6"
                            />
                        </div>
                        <GraduationCap className="w-12 h-12" />
                        <p className="text-3xl">I'm starting as a Student</p>
                        <CardDescription>
                            Student of a School or University
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card
                    className={`w-[350px] cursor-pointer hover:shadow-lg transition-shadow duration-300 ${
                        selectedRole === 'teacher'
                            ? 'border-primary shadow-lg'
                            : ''
                    }`}
                    onClick={() => setSelectedRole('teacher')}
                >
                    <CardHeader>
                        <div className="w-full flex justify-end">
                            <RadioGroupItem
                                value="teacher"
                                id="teacher"
                                className="w-6 h-6"
                            />
                        </div>
                        <Presentation className="w-12 h-12" />
                        <p className="text-3xl">I'm starting as a Teacher</p>
                        <CardDescription>
                            Teacher of a School or University
                        </CardDescription>
                    </CardHeader>
                </Card>
            </RadioGroup>

            <Button disabled={!selectedRole} size="lg" onClick={handleContinue}>
                Continue {selectedRole || '...'}
            </Button>
        </div>
    )
}
