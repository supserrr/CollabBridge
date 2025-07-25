export declare const generateSlug: (text: string) => string;
export declare const generateRandomString: (length?: number) => string;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export declare const paginate: (page?: number, limit?: number) => {
    skip: number;
    take: number;
};
export declare const buildPaginationResponse: (data: any[], page: number, limit: number, total: number) => {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};
export declare const isValidEmail: (email: string) => boolean;
export declare const maskEmail: (email: string) => string;
export declare const generateOTP: (length?: number) => string;
export declare const sleep: (ms: number) => Promise<void>;
//# sourceMappingURL=helpers.d.ts.map