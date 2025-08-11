
import { z } from 'zod';


const reserveDetailsSchema = z.object({
    body: z.object({
        carId: z.string({ invalid_type_error: "CarId must be a string" }),
        bookedUser: z.string({ invalid_type_error: "bookedUser must be a object id" }).optional(),
        startDate: z.preprocess((val) => new Date(val as string), z.date().refine((date) => !isNaN(date.getTime()), {
            message: "Start Date must be a valid date format",
        })),

        endDate: z.preprocess((val) => new Date(val as string), z.date().refine((date) => !isNaN(date.getTime()), {
            message: "End Date must be a valid date format",
        })),
        // user: z.string({ invalid_type_error: "user must be a string" }).optional(),
        bookingType: z.enum(['Instant', 'Reservation'], { invalid_type_error: "Booking Type must be 'Instant' or 'Reservation'" }),
    })
})




//   carId: Types.ObjectId
//   name: string,
//   startDate: Date
//   endDate: Date
//   drivingLicense: string[],
//   yourID: string[]


export const ReserveDetailsValidations = {
    reserveDetailsSchema
};


