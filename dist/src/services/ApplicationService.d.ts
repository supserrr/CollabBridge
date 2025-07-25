import { ApplicationStatus } from '@prisma/client';
export interface CreateApplicationData {
    eventId: string;
    userId: string;
    professionalId: string;
    message?: string;
    proposedRate?: number;
    availability?: any;
    portfolio?: string[];
}
export interface UpdateApplicationData {
    status?: ApplicationStatus;
    response?: string;
    proposedRate?: number;
    availability?: any;
    portfolio?: string[];
}
export interface ApplicationFilters {
    eventId?: string;
    userId?: string;
    professionalId?: string;
    status?: ApplicationStatus;
    startDate?: Date;
    endDate?: Date;
}
export interface ApplicationWithDetails {
    id: string;
    eventId: string;
    userId: string;
    professionalId: string;
    message: string | null;
    proposedRate: number | null;
    availability: any;
    portfolio: string[];
    status: ApplicationStatus;
    response: string | null;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    events: {
        id: string;
        title: string;
        description: string;
        eventType: string;
        startDate: Date;
        endDate: Date;
        location: string;
        budget: number | null;
        requiredRoles: string[];
        status: string;
    };
    users: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    creative_profiles: {
        id: string;
        categories: string[];
        hourlyRate: number | null;
        dailyRate: number | null;
        experience: string | null;
        skills: string[];
        users: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
        };
    };
}
export declare class ApplicationService {
    createApplication(data: CreateApplicationData): Promise<ApplicationWithDetails>;
    updateApplication(applicationId: string, data: UpdateApplicationData, updatedBy: string): Promise<ApplicationWithDetails>;
    getApplicationsByEvent(eventId: string, page?: number, limit?: number, status?: ApplicationStatus): Promise<{
        applications: ({
            creative_profiles: {
                users: {
                    role: import(".prisma/client").$Enums.UserRole;
                    username: string | null;
                    password: string | null;
                    name: string;
                    isActive: boolean;
                    id: string;
                    firebaseUid: string | null;
                    email: string;
                    displayName: string | null;
                    location: string | null;
                    bio: string | null;
                    avatar: string | null;
                    phone: string | null;
                    timezone: string;
                    language: string;
                    isVerified: boolean;
                    isPublic: boolean;
                    marketingConsent: boolean;
                    lastActiveAt: Date;
                    verificationDocs: import("@prisma/client/runtime/library").JsonValue | null;
                    metadata: import("@prisma/client/runtime/library").JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
                id: string;
                categories: string[];
                hourlyRate: number | null;
                dailyRate: number | null;
                experience: string | null;
                skills: string[];
            } & {
                responseTime: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                categories: string[];
                portfolioImages: string[];
                portfolioLinks: string[];
                hourlyRate: number | null;
                dailyRate: number | null;
                experience: string | null;
                equipment: string | null;
                skills: string[];
                languages: string[];
                availableFrom: Date | null;
                availableTo: Date | null;
                workingHours: import("@prisma/client/runtime/library").JsonValue | null;
                isAvailable: boolean;
                travelRadius: number | null;
                certifications: string[];
                awards: string[];
                socialMedia: import("@prisma/client/runtime/library").JsonValue | null;
            };
            users: {
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
                id: string;
                email: string;
            };
        } & {
            message: string | null;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            portfolio: string[];
            proposedRate: number | null;
            availability: import("@prisma/client/runtime/library").JsonValue | null;
            eventId: string;
            professionalId: string;
            response: string | null;
            respondedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getApplicationsByusers(userId: string, page?: number, limit?: number, status?: ApplicationStatus): Promise<{
        applications: ({
            creative_profiles: {
                users: {
                    role: import(".prisma/client").$Enums.UserRole;
                    username: string | null;
                    password: string | null;
                    name: string;
                    isActive: boolean;
                    id: string;
                    firebaseUid: string | null;
                    email: string;
                    displayName: string | null;
                    location: string | null;
                    bio: string | null;
                    avatar: string | null;
                    phone: string | null;
                    timezone: string;
                    language: string;
                    isVerified: boolean;
                    isPublic: boolean;
                    marketingConsent: boolean;
                    lastActiveAt: Date;
                    verificationDocs: import("@prisma/client/runtime/library").JsonValue | null;
                    metadata: import("@prisma/client/runtime/library").JsonValue | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
                id: string;
                categories: string[];
                hourlyRate: number | null;
                dailyRate: number | null;
                experience: string | null;
                skills: string[];
            } & {
                responseTime: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                categories: string[];
                portfolioImages: string[];
                portfolioLinks: string[];
                hourlyRate: number | null;
                dailyRate: number | null;
                experience: string | null;
                equipment: string | null;
                skills: string[];
                languages: string[];
                availableFrom: Date | null;
                availableTo: Date | null;
                workingHours: import("@prisma/client/runtime/library").JsonValue | null;
                isAvailable: boolean;
                travelRadius: number | null;
                certifications: string[];
                awards: string[];
                socialMedia: import("@prisma/client/runtime/library").JsonValue | null;
            };
            events: {
                description: string;
                status: import(".prisma/client").$Enums.EventStatus;
                id: string;
                location: string;
                title: string;
                eventType: import(".prisma/client").$Enums.EventType;
                startDate: Date;
                endDate: Date;
                budget: number | null;
                requiredRoles: string[];
            };
        } & {
            message: string | null;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            portfolio: string[];
            proposedRate: number | null;
            availability: import("@prisma/client/runtime/library").JsonValue | null;
            eventId: string;
            professionalId: string;
            response: string | null;
            respondedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getApplicationById(applicationId: string): Promise<ApplicationWithDetails>;
    withdrawApplication(applicationId: string, userId: string): Promise<void>;
    getApplicationStatistics(eventId?: string, userId?: string): Promise<{
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
        acceptanceRate: number;
    }>;
    private isValidStatusTransition;
    private sendStatusChangeNotification;
}
export declare const applicationService: ApplicationService;
//# sourceMappingURL=ApplicationService.d.ts.map