
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IssueStatusBadge } from "@/components/issue-status-badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { IssueStatus, IssueCategory } from "@/lib/types";

type ReportedIssue = {
  id: string;
  category: IssueCategory;
  address: string;
  reportedDate: Timestamp;
  status: IssueStatus;
}

export default function IssuesPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const issuesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "reportedIssues"), orderBy("reportedDate", "desc"));
  }, [firestore, user]);

  const { data: issues, isLoading } = useCollection<ReportedIssue>(issuesQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reported Issues</CardTitle>
        <CardDescription>
          A list of all issues you have reported.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reported On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {issues && issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium truncate max-w-[100px]">{issue.id}</TableCell>
                <TableCell>{issue.category}</TableCell>
                <TableCell>{issue.address}</TableCell>
                <TableCell>
                  {issue.reportedDate ? issue.reportedDate.toDate().toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <IssueStatusBadge status={issue.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/dashboard/issues/${issue.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && (!issues || issues.length === 0) && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        You have not reported any issues yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

