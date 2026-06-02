import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, Eye, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUser } from '@/contexts/user'

import { ChangeInstitutionMemberRoleDialog } from './ChangeInstitutionMemberRoleDialog'
import { TransferInstitutionOwnershipDialog } from './TransferInstitutionOwnershipDialog'
import type { Institution } from '../types/institution.types'

type InstitutionRowActionsPopoverProps = {
  institution: Institution
}

const InstitutionRowActionsPopover = ({ institution }: InstitutionRowActionsPopoverProps) => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const role = getRole()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [changeRoleOpen, setChangeRoleOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const handleViewDetails = () => {
    setPopoverOpen(false)
    navigate(`/${role}/institution/${institution.id}`)
  }

  const handleChangeRole = () => {
    setPopoverOpen(false)
    setChangeRoleOpen(true)
  }

  const handleTransferOwnership = () => {
    setPopoverOpen(false)
    setTransferOpen(true)
  }

  return (
    <>
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="darkblue"
            size="sm"
          >
            {t('institutions.table.viewDetails')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-52 p-2"
        >
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={handleViewDetails}
            >
              <Eye
                className="size-4 shrink-0"
                aria-hidden
              />
              {t('institutions.actions.viewDetails')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={handleChangeRole}
            >
              <UserCog
                className="size-4 shrink-0"
                aria-hidden
              />
              {t('institutions.actions.changeRole')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={handleTransferOwnership}
            >
              <ArrowRightLeft
                className="size-4 shrink-0"
                aria-hidden
              />
              {t('institutions.actions.transferOwnership')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ChangeInstitutionMemberRoleDialog
        institution={institution}
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
      />
      <TransferInstitutionOwnershipDialog
        institution={institution}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
    </>
  )
}

export { InstitutionRowActionsPopover }
