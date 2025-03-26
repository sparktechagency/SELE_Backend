import { z } from 'zod';


const createTermsAndConditionsZodSchema = z.object({
    body: z.object({
        description: z.string().min(1, { message: "Description is required" })
    })
})

export const termsAndConditionsValidations = { createTermsAndConditionsZodSchema };
