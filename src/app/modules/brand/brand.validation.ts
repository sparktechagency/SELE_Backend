import { z } from 'zod';

const brandValidationSchema = z.object({
    body: z.object({
        // fuelCategory: z.string({
        //     required_error: "Fuel Category is required"
        // }),
        // carType: z.string({
        //     required_error: "car Type is required"
        // }),
        // transmission: z.string({
        //     required_error: "Provide transmission."
        // }),
        // seatNumber: z.string({
        //     required_error: "seat seat number it's required"
        // }),
        // interiorColor: z.string({
        //     required_error: "interiorColor is required"
        // }),
        // pricePerDay: z.string({
        //     required_error: "pricePerDay is required"
        // }),
        brandName: z.string({
            required_error: "Brand Name is required"            
        }),
        logo: z.any(),
    })
})


export const BrandValidations = {
    brandValidationSchema
};
