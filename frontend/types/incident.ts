
export type Incident = {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    validity: 'PENDING' | 'VALIDATED' | 'REJECTED';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reporterId: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    images: string[];
    votes: number;
    createdAt: string;
    updatedAt: string;
}