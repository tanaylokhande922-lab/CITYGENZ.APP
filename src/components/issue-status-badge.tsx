import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/types";

type IssueStatusBadgeProps = {
  status: IssueStatus;
};

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const variant = {
    Reported: "secondary",
    "In Review": "default",
    "In Progress": "destructive", // Using destructive for accent orange
    Resolved: "outline", // A different style to signify completion
  } as const;

  const getVariantClass = (status: IssueStatus) => {
    switch (status) {
        case 'Reported': return 'bg-muted text-muted-foreground';
        case 'In Review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'In Progress': return 'bg-accent text-accent-foreground';
        case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  }

  return (
    <Badge className={getVariantClass(status)}>{status}</Badge>
  );
}
