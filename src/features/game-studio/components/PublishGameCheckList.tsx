'use client'

import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { ValidationResult } from '../utils/publishValidation'
import { getDisplayNameForNodeType } from '../utils/publishValidation'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

export interface PublishGameCheckListProps {
  validationResult: ValidationResult
}

export default function PublishGameCheckList({ validationResult }: PublishGameCheckListProps) {
  const { nodeItems, globalErrors } = validationResult
  const hasAnyErrors = globalErrors.length > 0 || nodeItems.some((item) => item.errors.length > 0)

  return (
    <Card className="border-slate-200">
      <CardHeader className="">
        <CardTitle className="text-base text-slate-800 flex gap-2 items-center">
          {hasAnyErrors ? (
            <X className="size-4 text-slate-600 shrink-0" />
          ) : (
            <Check className="size-4 text-slate-600 shrink-0" />
          )}
          Requirements {hasAnyErrors ? 'not met' : 'met'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Alert
          variant="default"
          className="border-slate-200 bg-slate-50 text-slate-800 [&>svg]:text-slate-600"
        >
          <AlertTitle className="text-slate-800">Publishing rules</AlertTitle>
          <AlertDescription className="text-slate-600 gap-0.5">
            <ul className="list-disc list-inside space-y-0.5">
              <li>No abandoned or disconnected nodes</li>
              <li>All nodes linked from Start to End</li>
              <li>All nodes connected (path Start to End).</li>
              <li>Each node minimally filled so the game is playable.</li>
            </ul>
          </AlertDescription>
        </Alert>
        <Separator />
        <div className="space-y-1">
          {globalErrors.map((msg, i) => (
            <div
              key={`global-${i}`}
              className="flex items-center gap-2 flex-wrap text-sm text-slate-700"
            >
              <X className="size-4 text-slate-600 shrink-0" />
              <Text
                as="span"
                variant="small"
              >
                {msg}
              </Text>
            </div>
          ))}
          {nodeItems.map((item) => {
            const displayName = getDisplayNameForNodeType(item.node.type)
            if (item.errors.length === 0) return null
            return item.errors.map((err, i) => (
              <div
                key={`${item.node.id}-${i}`}
                className="flex items-center gap-2 flex-wrap text-sm text-slate-700"
              >
                <Badge
                  variant="secondary"
                  className="text-slate-800"
                >
                  {displayName}
                </Badge>
                <Separator
                  orientation="vertical"
                  className="h-4 bg-slate-300"
                />
                <Text
                  as="span"
                  variant="small"
                >
                  {err}
                </Text>
              </div>
            ))
          })}
        </div>
      </CardContent>
    </Card>
  )
}
