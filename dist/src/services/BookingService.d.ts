export interface CreateBookingData {
    eventId: string;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    rate: number;
    currency?: string;
    description?: string;
    requirements?: string[];
    notes?: string;
}
export interface UpdateBookingStatusData {
    status: string;
    notes?: string;
    cancellationReason?: string;
}
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class BookingService {
    private notificationService;
    private emailService;
    constructor();
    createBooking(eventId: string, professionalId: string, plannerusersId: string, bookingData: CreateBookingData): Promise<{
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
        event_planners: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            companyName: string | null;
            website: string | null;
            taxId: string | null;
        };
        events: {
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            id: string;
            location: string;
            isPublic: boolean;
            createdAt: Date;
            updatedAt: Date;
            images: string[];
            title: string;
            eventType: import(".prisma/client").$Enums.EventType;
            startDate: Date;
            endDate: Date;
            address: string | null;
            budget: number | null;
            currency: string;
            requiredRoles: string[];
            tags: string[];
            maxApplicants: number | null;
            requirements: string | null;
            deadlineDate: Date | null;
            eventPlannerId: string;
            isFeatured: boolean;
            attachments: import("@prisma/client/runtime/library").JsonValue | null;
            contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        };
    } & {
        description: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date;
        currency: string;
        requirements: string[];
        eventPlannerId: string;
        eventId: string;
        professionalId: string;
        rate: number;
        confirmedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
        notes: string | null;
        contract: string | null;
    }>;
    updateBookingStatus(bookingId: string, userId: string, statusData: UpdateBookingStatusData): Promise<{
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
        event_planners: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            companyName: string | null;
            website: string | null;
            taxId: string | null;
        };
        events: {
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            id: string;
            location: string;
            isPublic: boolean;
            createdAt: Date;
            updatedAt: Date;
            images: string[];
            title: string;
            eventType: import(".prisma/client").$Enums.EventType;
            startDate: Date;
            endDate: Date;
            address: string | null;
            budget: number | null;
            currency: string;
            requiredRoles: string[];
            tags: string[];
            maxApplicants: number | null;
            requirements: string | null;
            deadlineDate: Date | null;
            eventPlannerId: string;
            isFeatured: boolean;
            attachments: import("@prisma/client/runtime/library").JsonValue | null;
            contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        };
    } & {
        description: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date;
        currency: string;
        requirements: string[];
        eventPlannerId: string;
        eventId: string;
        professionalId: string;
        rate: number;
        confirmedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
        notes: string | null;
        contract: string | null;
    }>;
    getBookingsByusers(userId: string, userRole: string, filters?: any): Promise<{
        bookings: ({
            creative_profiles: {
                users: {
                    name: string;
                    id: string;
                    avatar: string | null;
                };
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
            event_planners: {
                users: {
                    name: string;
                    id: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string | null;
                website: string | null;
                taxId: string | null;
            };
            events: {
                id: string;
                location: string;
                title: string;
                eventType: import(".prisma/client").$Enums.EventType;
                startDate: Date;
                endDate: Date;
            };
        } & {
            description: string | null;
            status: import(".prisma/client").$Enums.BookingStatus;
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            startDate: Date;
            endDate: Date;
            currency: string;
            requirements: string[];
            eventPlannerId: string;
            eventId: string;
            professionalId: string;
            rate: number;
            confirmedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            notes: string | null;
            contract: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getBookingById(bookingId: string, userId: string): Promise<{
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
        event_planners: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            companyName: string | null;
            website: string | null;
            taxId: string | null;
        };
        events: {
            event_planners: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string | null;
                website: string | null;
                taxId: string | null;
            };
        } & {
            description: string;
            status: import(".prisma/client").$Enums.EventStatus;
            id: string;
            location: string;
            isPublic: boolean;
            createdAt: Date;
            updatedAt: Date;
            images: string[];
            title: string;
            eventType: import(".prisma/client").$Enums.EventType;
            startDate: Date;
            endDate: Date;
            address: string | null;
            budget: number | null;
            currency: string;
            requiredRoles: string[];
            tags: string[];
            maxApplicants: number | null;
            requirements: string | null;
            deadlineDate: Date | null;
            eventPlannerId: string;
            isFeatured: boolean;
            attachments: import("@prisma/client/runtime/library").JsonValue | null;
            contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        };
        reviews: ({
            users_reviews_reviewerIdTousers: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            isPublic: boolean;
            createdAt: Date;
            updatedAt: Date;
            skills: string[];
            professionalId: string | null;
            response: string | null;
            bookingId: string;
            rating: number;
            comment: string;
            communication: number | null;
            professionalism: number | null;
            quality: number | null;
            reviewerId: string;
            revieweeId: string;
            flexibility: number | null;
            punctuality: number | null;
        })[];
    } & {
        description: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date;
        currency: string;
        requirements: string[];
        eventPlannerId: string;
        eventId: string;
        professionalId: string;
        rate: number;
        confirmedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
        notes: string | null;
        contract: string | null;
    }>;
    private checkDateConflict;
    private getValidStatusTransitions;
    private buildPagination;
    getBookingStatistics(userId: string, userRole: string): Promise<{
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        totalRevenue: number;
    }>;
}
export declare const bookingService: BookingService;
//# sourceMappingURL=BookingService.d.ts.map