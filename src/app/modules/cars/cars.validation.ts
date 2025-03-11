import { z } from 'zod';
import { fuelType } from '../../../enums/fuel';
const CarsValidationSchema = z.object({
    body: z.object({
        carImage: z.string().min(1, "Car image is required"),
        brandName: z.string().min(1, "Brand name is required"),
        description: z.string().min(1, "Description is required"),
        outDoorColor: z.string().min(1, "Outdoor color is required"),
        interiorColor: z.string().min(1, "Interior color is required"),
        fuelType: z.enum(Object.values(fuelType) as [string, ...string[]]),
        fuelCapacity: z.string().min(1, "Fuel capacity is required"),
        kilometresData: z.string().min(1, "Kilometres data is required"),
        carSeatsNumber: z.number().min(1, "Car seats number must be at least 1"),
        transmission: z.enum(["Manual", "Automatic"], { errorMap: () => ({ message: "Invalid transmission type" }) }),
        price: z.number().min(0, 'Price cannot be negative'),
        ProtectionPlan: z.array(z.string()).min(1, 'At least one protection plan is required'),
    })
})
export const CarsValidations = {
    CarsValidationSchema
};
