export interface AvatarOption {
  name: string;
  src: string;
  emoji: string;
  description?: string;
}

export interface Institution {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  address: Record<string, any> | null;
  website: string | null;
}

export interface AccountData {
  username: string;
  displayName: string;
  description: string;
  avatar: AvatarOption;
}

export interface StepAccountProps {
  onNext: (data: AccountData) => void;
  initialData?: {
    username: string;
    displayName: string;
    description: string;
    avatarIndex: number;
  };
}

export interface StepInstitutionProps {
  onNext: (selectedInstitutions: Institution[]) => void;
  onBack: () => void;
  initialData?: string[];
}

export interface StepFinishProps {
  onBack: () => void;
  onFinish: () => void;
  accountData: AccountData;
  institutions: Institution[];
}

