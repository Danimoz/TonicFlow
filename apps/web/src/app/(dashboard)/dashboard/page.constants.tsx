import { FileText, Music, Plus, Settings } from "lucide-react";

export const getQuickActions = (clickAction: Map<string, () => void>, totalProjects: number) => [
  {
    icon: <Plus className="h-6 w-6 text-primary" />,
    label: "New Project",
    description: "Create a new music notation project",
    cardClass: '',
    theme: "bg-primary/10",
    clickAction: clickAction.get("newProject") || (() => {}),
  },
  {
    icon: <FileText className="h-6 w-6 text-accent" />,
    label: "Templates",
    description: "Start with a template (Coming Soon)",
    cardClass: 'opacity-50',
    theme: "bg-accent/10",
    clickAction: (() => {}),
  },
  {
    icon: <Music className="h-6 w-6 text-green-500" />,
    label: "Total Projects",
    description: `${totalProjects} project${totalProjects !== 1 ? 's' : ''}`,
    cardClass: '',
    theme: "bg-green-500/10",
    clickAction: (() => {}),
  },
  {
    icon: <Settings className="h-6 w-6 text-orange-500" />,
    label: "Settings",
    description: "Manage your account settings (Coming Soon)",
    cardClass: 'opacity-50',
    theme: "bg-orange-500/10",
    clickAction: () => {},
  },
];