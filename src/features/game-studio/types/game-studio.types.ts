import type { LucideIcon } from 'lucide-react';
  export interface GameNodeTemplate {
  id: string;
  label: string;
  type: string;
}


export interface GameOption {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  component: React.ComponentType;
}
