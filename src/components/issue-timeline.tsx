import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IssueUpdate } from "@/lib/types";

type IssueTimelineProps = {
  updates: IssueUpdate[];
};

export function IssueTimeline({ updates }: IssueTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolution Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {updates.map((update, index) => (
            <div key={index} className="relative pb-8">
              {index !== updates.length - 1 && (
                <div className="absolute left-[0.2rem] top-2 h-full w-0.5 bg-border" />
              )}
              <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
              <div className="pl-4">
                <p className="font-semibold">{update.status}</p>
                <p className="text-sm text-muted-foreground">{new Date(update.date).toLocaleString()}</p>
                <p className="mt-1 text-sm">{update.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
