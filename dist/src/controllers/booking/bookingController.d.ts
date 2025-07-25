import { Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare class BookingController {
    createBooking(req: AuthRequest, res: Response): Promise<void>;
    getBookings(req: AuthRequest, res: Response): Promise<void>;
    updateBookingStatus(req: AuthRequest, res: Response): Promise<void>;
    updateBooking(req: AuthRequest, res: Response): Promise<void>;
    getBooking(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=bookingController.d.ts.map