import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Search, Check } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EmptyInstitutionView from './EmptyInstitutionView'
import Spinner from '@/components/ui/spinner'
import { fetchInstitutions } from '../api/onboardingApi'
import type { StepInstitutionProps, Institution } from '../types/onboarding.types'
import { Text } from '@/components/ui/text'

export default function StepInstitution({ onNext, onBack, initialData }: StepInstitutionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(initialData || [])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch institutions from API
  useEffect(() => {
    async function loadInstitutions() {
      try {
        const fetchedInstitutions = await fetchInstitutions()
        setInstitutions(fetchedInstitutions)
      } catch (error) {
        console.error('Error loading institutions:', error)
        setInstitutions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadInstitutions()
  }, [])

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (inst.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const toggleInstitution = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleContinue = () => {
    const selected = institutions.filter((inst) => selectedIds.includes(inst.id))
    onNext(selected)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner
          variant="black"
          size="xl"
          speed={1750}
        />
      </div>
    )
  }

  // Empty state
  if (institutions.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Text
            as="h2"
            variant="h2"
            className="text-3xl font-light mb-2"
          >
            Follow Institutions
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground text-sm"
          >
            Select institutions to follow and get all updates
          </Text>
        </div>
        <EmptyInstitutionView />
        <div className="flex justify-between gap-4 py-11">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleContinue}
            disabled={selectedIds.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <Text
          as="h2"
          variant="h2"
          className="text-3xl font-light mb-2"
        >
          Follow Institutions
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-muted-foreground text-sm"
        >
          Select institutions to follow and get all updates
        </Text>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="search"
          className="font-light"
        >
          Search Institutions
        </Label>
        <InputGroup>
          <InputGroupInput
            id="search"
            placeholder="Search by name, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filteredInstitutions.length} result{filteredInstitutions.length !== 1 ? 's' : ''}
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Institutions List */}
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredInstitutions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No institutions found matching "{searchTerm}"
          </div>
        ) : (
          filteredInstitutions.map((institution) => {
            const isSelected = selectedIds.includes(institution.id)
            return (
              <Card
                key={institution.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-primary border-2 bg-primary/5' : 'border-gray-200'
                }`}
                onClick={() => toggleInstitution(institution.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{institution.name}</CardTitle>
                      {institution.description && (
                        <CardDescription className="text-sm">
                          {institution.description}
                        </CardDescription>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 ml-4">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {institution.email && (
                    <Text
                      as="p"
                      variant="body"
                      className="text-xs text-muted-foreground"
                    >
                      ✉️ {institution.email}
                    </Text>
                  )}
                  {institution.website && (
                    <Text
                      as="p"
                      variant="body"
                      className="text-xs text-muted-foreground"
                    >
                      🌐 {institution.website}
                    </Text>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Selected Count */}
      {selectedIds.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {selectedIds.length} institution{selectedIds.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 py-11">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
