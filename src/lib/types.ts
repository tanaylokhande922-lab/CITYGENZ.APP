
export type IssueStatus = 'Reported' | 'In Review' | 'In Progress' | 'Resolved';
export type IssueCategory = 'Pothole' | 'Streetlight' | 'Waste Management' | 'Other';

export type IssueUpdate = {
  status: string;
  date: string;
  description: string;
};

// Represents an issue from the old static data
export type StaticIssue = {
  id: string;
  category: IssueCategory;
  description: string;
  location: { lat: number; lng: number; address: string };
  imageUrl: string;
  imageHint: string;
  reportedAt: string;
  status: IssueStatus;
  updates: IssueUpdate[];
  reporter: { name: string; avatarUrl: string; };
  estimatedCompletion?: string;
};

// Represents an issue document stored in Firestore
export type ReportedIssue = {
    id: string; // Document ID
    userId: string;
    category: IssueCategory;
    description: string;
    photoUrl: string;
    latitude: number;
    longitude: number;
    address: string;
    reportedDate: any; // Firestore Timestamp
    status: IssueStatus;
    updates?: IssueUpdate[];
    estimatedCompletion?: string;
}
