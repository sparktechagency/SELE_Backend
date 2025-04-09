import { z } from 'zod';



const createPrivacyAndPolicyZodSchema = z.object({
    body: z.object({
        description: z.string().min(1, { message: "Description is required" })
    })
})

export const PrivacyAndPolicyValidations = {  createPrivacyAndPolicyZodSchema };
