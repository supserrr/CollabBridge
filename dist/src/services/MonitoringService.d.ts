import { Request, Response } from 'express';
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
        cache: ServiceHealth;
        memory: ServiceHealth;
        disk: ServiceHealth;
    };
    metrics: SystemMetrics;
    dependencies?: ExternalDependencyHealth[];
}
interface ServiceHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
    details?: any;
}
interface SystemMetrics {
    memory: {
        used: number;
        total: number;
        percentage: number;
        heap: {
            used: number;
            total: number;
            percentage: number;
        };
    };
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    process: {
        pid: number;
        uptime: number;
        nodeVersion: string;
    };
    requests?: {
        total: number;
        errors: number;
        averageResponseTime: number;
    };
}
interface ExternalDependencyHealth {
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
}
export declare class MonitoringService {
    private requestMetrics;
    checkDatabaseHealth(): Promise<ServiceHealth>;
    checkRedisHealth(): Promise<ServiceHealth>;
    checkCacheHealth(): Promise<ServiceHealth>;
    checkMemoryHealth(): ServiceHealth;
    checkDiskHealth(): ServiceHealth;
    getSystemMetrics(): SystemMetrics;
    getHealthCheck(): Promise<HealthCheckResult>;
    trackRequest(responseTime: number, isError?: boolean): void;
    resetMetrics(): void;
    getDatabaseStats(): Promise<{
        users: {
            total: number;
            active: number;
        };
        events: {
            total: number;
        };
        bookings: {
            total: number;
            recent: number;
        };
        reviews: {
            total: number;
        };
    }>;
}
export declare const monitoringService: MonitoringService;
export declare const requestTrackingMiddleware: (req: Request, res: Response, next: any) => void;
export {};
//# sourceMappingURL=MonitoringService.d.ts.map