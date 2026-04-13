import { Pattern as AvatarGroupIconCount } from '@/components/shared/AvatarGroupIconCount'
import { Pattern as AvatarGroupNumericalCount } from '@/components/shared/AvatarGroupNumericalCount'
import { Pattern as CardImageScaleHoverEffect } from '@/components/shared/CardImageScaleHoverEffect'
import { Pattern as CompactSettingsTableSwitches } from '@/components/shared/CompactSettingsTableSwitches'
import { Pattern as ExpandableBillingUsageCard } from '@/components/shared/ExpandableBillingUsageCard'
import FormLayout04 from '@/components/shared/FormLayout-04'
import FormLayout05 from '@/components/shared/FormLayout-05'
import { Pattern as ProjectTableTeamAvatarStatus } from '@/components/shared/ProjectTableTeamAvatarStatus'
import Stats01 from '@/components/shared/Stats-01'
import Stats11 from '@/components/shared/Stats-11'
import Stats12 from '@/components/shared/Stats-12'
import { Pattern as StatusSummeryCard } from '@/components/shared/StatusSummeryCard'
import { Pattern as SwitchListCardIcons } from '@/components/shared/SwitchListCardIcons'
import { Pattern as UserMessageNotificationAlert } from '@/components/shared/UserMessageNotificationAlert'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-wrap gap-6 items-start">{children}</div>
    </section>
  )
}

export default function Test() {
  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">UI Component Test Page</h1>

      <Section title="AvatarGroupIconCount">
        <AvatarGroupIconCount />
      </Section>

      <Section title="AvatarGroupNumericalCount">
        <AvatarGroupNumericalCount />
      </Section>

      <Section title="CardImageScaleHoverEffect">
        <CardImageScaleHoverEffect />
      </Section>

      <Section title="CompactSettingsTableSwitches">
        <CompactSettingsTableSwitches />
      </Section>

      <Section title="ExpandableBillingUsageCard">
        <ExpandableBillingUsageCard />
      </Section>

      <Section title="FormLayout-04">
        <FormLayout04 />
      </Section>

      <Section title="FormLayout-05">
        <FormLayout05 />
      </Section>

      <Section title="ProjectTableTeamAvatarStatus">
        <ProjectTableTeamAvatarStatus />
      </Section>

      <Section title="Stats-01">
        <Stats01 />
      </Section>

      <Section title="Stats-11">
        <Stats11 />
      </Section>

      <Section title="Stats-12">
        <Stats12 />
      </Section>

      <Section title="StatusSummeryCard">
        <StatusSummeryCard />
      </Section>

      <Section title="SwitchListCardIcons">
        <SwitchListCardIcons />
      </Section>

      <Section title="UserMessageNotificationAlert">
        <UserMessageNotificationAlert />
      </Section>
    </div>
  )
}
