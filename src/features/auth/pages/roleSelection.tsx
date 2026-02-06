import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Presentation } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useUser } from '@/contexts/user'
import type { Roles } from '@/components/layout/config'
import { Text } from '@/components/ui/text'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const navigate = useNavigate()
  const { t } = useTranslation('roleSelection')
  const { setPendingRole } = useUser()

  const handleContinue = () => {
    if (selectedRole) {
      setPendingRole(selectedRole)
      navigate('/auth/signup')
    }
  }

  return (
    <div className="w-screen h-screen container flex mx-auto flex-col items-center justify-center gap-8">
      <Text as="h1" variant="h1" className="text-4xl font-light">
        {t('title')}{' '}
        {selectedRole && (
          <Text as="span" variant="small">
            <Text as="span" variant="small" className="mr-2.5">{t('asA')}</Text>
            <Text as="span" variant="small" className="bg-gray-100 text-black rounded-2xl px-4 py-2 capitalize">
              {selectedRole}
            </Text>
          </Text>
        )}
      </Text>

      <RadioGroup
        className="flex gap-4"
        value={selectedRole}
        onValueChange={setSelectedRole}
      >
        <Card
          className={`w-[350px] cursor-pointer transition-shadow duration-300 hover:shadow-lg ${
            selectedRole === 'student' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedRole('student')}
        >
          <CardHeader>
            <div className="flex w-full justify-end">
              <RadioGroupItem
                value="student"
                id="student"
                className="h-6 w-6"
              />
            </div>
            <div className="inline-flex p-3 bg-gray-100 rounded-lg w-fit">
              <GraduationCap className="h-8 w-8 text-gray-600" />
            </div>
            <Text as="p" variant="body" className="text-3xl">{t('student.title')}</Text>
            <CardDescription>{t('student.desc')}</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`w-[350px] cursor-pointer transition-shadow duration-300 hover:shadow-lg ${
            selectedRole === 'teacher' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedRole('teacher' as Roles)}
        >
          <CardHeader>
            <div className="flex w-full justify-end">
              <RadioGroupItem
                value="teacher"
                id="teacher"
                className="h-6 w-6"
              />
            </div>
            <div className="inline-flex p-3 bg-gray-100 rounded-lg w-fit">
              <Presentation className="h-8 w-8 text-gray-600" />
            </div>
            <Text as="p" variant="body" className="text-3xl">{t('teacher.title')}</Text>
            <CardDescription>{t('teacher.desc')}</CardDescription>
          </CardHeader>
        </Card>
      </RadioGroup>

      <Button
        disabled={!selectedRole}
        size="lg"
        onClick={handleContinue}
      >
        {selectedRole ? t('continue', { role: selectedRole }) : t('continueIdle')}
      </Button>
    </div>
  )
}