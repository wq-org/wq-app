import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Container } from '@/components/shared'

const FEEDBACK_TYPES = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
]

export default function CommandFeedbackForm() {
  const [type, setType] = useState<string>('feedback')
  const [message, setMessage] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API call or event here
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Alert
        variant="default"
        className="w-full max-w-md mx-auto mt-8"
      >
        {/* Removed icon */}
        <AlertTitle className="font-light">Thank you!</AlertTitle>
        <AlertDescription className="font-light">
          Your feedback has been submitted successfully.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Container className="px-0">
      <Card className="w-full shadow-none border-0 px-0 py-0">
        <CardHeader className="pb-2">
          <div className="flex-1">
            <h2 className="text-xl font-light leading-none">Send Feedback</h2>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              Tell us what’s on your mind. We read every message.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-[12rem] flex-col"
          >
            <div className="flex flex-col gap-4 pr-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="feedback-type"
                  className="font-light"
                >
                  Type
                </Label>
                <Select
                  value={type}
                  onValueChange={setType}
                  name="type"
                >
                  <SelectTrigger className="h-10 font-light">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_TYPES.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="font-light"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="feedback-message"
                  className="font-light"
                >
                  Message
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="feedback-message"
                  placeholder="Describe your feedback, bug, or idea..."
                  required
                  className="h-28 resize-none font-light"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-4 w-full font-light"
              disabled={!message.trim()}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}
