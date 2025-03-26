import { z } from 'zod';


const createChatZodSchema = z.object({
    body: z.object({
        participants: z.array(z.string()),
    }),
});



export const ChatValidations = {
    createChatZodSchema,
};
