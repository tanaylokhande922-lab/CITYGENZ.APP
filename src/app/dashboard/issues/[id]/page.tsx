import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { issues } from "@/lib/data";
import { IssueStatusBadge } from "@/components/issue-status-badge";
import { IssueTimeline } from "@/components/issue-timeline";
import { notFound } from "next/navigation";
import { PotholeIcon } from "@/components/icons";
import { Lightbulb, Trash2, HelpCircle } from "lucide-react";
import type { IssueCategory } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categoryIcons: Record<IssueCategory, React.ElementType> = {
  Pothole: PotholeIcon,
  Streetlight: Lightbulb,
  "Waste Management": Trash2,
  Other: HelpCircle,
};

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = issues.find((i) => i.id === params.id);

  if (!issue) {
    notFound();
  }

  const Icon = categoryIcons[issue.category];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-2xl">Issue: {issue.id}</CardTitle>
                </div>
                <CardDescription>{issue.location.address}</CardDescription>
              </div>
              <IssueStatusBadge status={issue.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 border">
              <Image
                src={issue.imageUrl}
                alt={issue.description}
                fill
                className="object-cover"
                data-ai-hint={issue.imageHint}
              />
            </div>
            <p className="text-foreground">{issue.description}</p>

            <div className="mt-6 flex items-center gap-4 border-t pt-4">
                <Avatar>
                    <AvatarImage src={issue.reporter.avatarUrl} alt={issue.reporter.name} />
                    <AvatarFallback>{issue.reporter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">Reported by {issue.reporter.name}</p>
                    <p className="text-sm text-muted-foreground">on {new Date(issue.reportedAt).toLocaleString()}</p>
                </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
            <IssueTimeline updates={issue.updates} />
        </div>
      </div>

      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Municipal Action</CardTitle>
            <CardDescription>Update the issue status and ETA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select defaultValue={issue.status}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Completion Date</Label>
              <Input
                id="eta"
                type="date"
                defaultValue={issue.estimatedCompletion}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Update Issue</Button>
          </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Map view placeholder</p>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
