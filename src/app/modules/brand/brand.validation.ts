import { z } from 'zod';

const brandValidationSchema = z.object({
    body: z.object({
        fuelCategory: z.string({
            required_error: "Fuel Category is required"
        }),
        carType: z.string({
            required_error: "car Type is required"
        }),
        transmission: z.string({
            required_error: "Provide transmission."
        }),
        seatNumber: z.number({
            required_error: "seat number is required"
        }),
        interiorColor: z.string({
            required_error: "interiorColor is required"
        }),
        pricePerDay: z.string({
            required_error: "pricePerDay is required"
        }),
        logo: z.string({
            required_error: "Please provide Logo"
        })
    })
})


export const BrandValidations = {
    brandValidationSchema
};
