export interface ProfessionalSearchFilters {
    categories?: string[];
    location?: string;
    minRating?: number;
    maxRate?: number;
    availability?: boolean;
    skills?: string[];
    search?: string;
    sortBy?: 'rate_low' | 'rate_high' | 'rating' | 'newest' | 'relevance';
    radius?: number;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
}
export interface EventSearchFilters {
    eventType?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    budgetMin?: number;
    budgetMax?: number;
    requiredRoles?: string[];
    search?: string;
    featured?: boolean;
    sortBy?: 'date' | 'budget' | 'relevance' | 'newest';
}
export interface SearchSuggestion {
    type: 'professional' | 'event' | 'skill' | 'location';
    text: string;
    count?: number;
}
export declare class SearchService {
    searchProfessionals(filters: ProfessionalSearchFilters, pagination: PaginationOptions): Promise<any>;
    searchEvents(filters: EventSearchFilters, pagination: PaginationOptions): Promise<{
        events: ({
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
            _count: {
                bookings: number;
                event_applications: number;
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
    private calculateAverageRating;
    private buildOrderBy;
    getPopularCategories(limit?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.Creative_profilesGroupByOutputType, "categories"[]> & {
        _count: {
            categories: number;
        };
    })[]>;
    getSearchSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>;
    getSearchFacets(filters: ProfessionalSearchFilters): Promise<any>;
    getTrendingSearches(limit?: number): Promise<any>;
    getSuggestedProfessionals(userId: string, limit?: number): Promise<({
        users: {
            name: string;
            id: string;
            location: string | null;
            bio: string | null;
            avatar: string | null;
        };
        _count: {
            bookings: number;
            reviews: number;
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
    })[]>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=SearchService.d.ts.map