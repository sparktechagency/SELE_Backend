
import { z } from 'zod';


const reserveDetailsSchema = z.object({
    body: z.object({
        carId: z.string({ invalid_type_error: "CarId must be a string" }),
        name: z.string({ invalid_type_error: "Name must be a string" }),
        startDate: z.preprocess((val) => new Date(val as string), z.date().refine((date) => !isNaN(date.getTime()), {
            message: "Start Date must be a valid date format",
        })),

        endDate: z.preprocess((val) => new Date(val as string), z.date().refine((date) => !isNaN(date.getTime()), {
            message: "End Date must be a valid date format",
        })),

        drivingLicense: z.array(z.string(), { invalid_type_error: "Driving License must be an array of strings" }),

        yourID: z.array(z.string(), { invalid_type_error: "Your ID must be an array of strings" })
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


