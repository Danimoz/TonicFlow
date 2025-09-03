'use client';

import { useEditor } from "@/contexts/editor-context";
import { SidebarAction, useSidebarActions } from "@/hooks/use-sidebar-actions";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * EditorSidebar component provides a collapsible sidebar for the editor tools.
 * It allows users to toggle the visibility of the sidebar and contains editor-related tools.
 */
export function EditorSidebar() {
  const { state, toggleSidebarCollapsed } = useEditor();
  const { groupedActions } = useSidebarActions();
  const isCollapsed = state?.preferences?.sidebarCollapsed;

  const getGroupTitle = (groupName: string) => {
    switch (groupName) {
      case 'view': return 'View Mode';
      case 'playback': return 'Playback';
      case 'layout': return 'Page Layout';
      default: return groupName;
    }
  };

  const renderActionButton = (action: any) => {
    const IconComponent = action.icon;

    return (
      <Button
        key={action.id}
        variant={action.isActive ? "default" : "ghost"}
        size={isCollapsed ? "icon" : "sm"}
        onClick={action.onClick}
        className={cn(
          'justify-start gap-2 h-9',
          isCollapsed ? 'w-9 justify-center pr-2' : 'w-full',
          action.isActive && 'bg-primary text-primary-foreground'
        )}
        title={isCollapsed ? action.label : undefined}
      >
        <IconComponent className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm">{action.label}</span>
        )}
      </Button>
    );
  };

  const renderGroup = (groupName: string, actions: SidebarAction[]) => (
    <div key={groupName} className="space-y-1">
      {!isCollapsed && (
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {getGroupTitle(groupName)}
        </h3>
      )}
      <div className="space-y-1">
        {actions.map(renderActionButton)}
      </div>
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed right-6 top-16 bg-background border border-border shadow-lg rounded-lg',
        'transition-all duration-300 ease-in-out overflow-hidden h-[calc(100vh-4rem)] max-h-[600px]',
        isCollapsed ? 'w-12' : 'w-64',
      )}
      role="complementary"
      aria-label="Editor tools Sidebar"
      aria-expanded={!isCollapsed}
    >
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground">Editor Tools</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'h-8 w-8 shrink-0',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-3 overflow-y-auto space-y-4">
        {Object.entries(groupedActions).map(([groupName, actions]) =>
          renderGroup(groupName, actions)
        )}
      </div>
    </aside>
  )
}