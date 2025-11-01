export type IssueStatus = 'Reported' | 'In Review' | 'In Progress' | 'Resolved';
export type IssueCategory = 'Pothole' | 'Streetlight' | 'Waste Management' | 'Other';

export type IssueUpdate = {
  status: string;
  date: string;
  description: string;
};

export type Issue = {
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
