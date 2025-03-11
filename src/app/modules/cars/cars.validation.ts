import { z } from 'zod';
import { fuelType } from '../../../enums/fuel';
const CarsValidationSchema = z.object({
    body: z.object({
        carImage: z.string().min(1, "Car image is required"),
        brandName: z.string().min(1, "Brand name is required"),
        description: z.string().min(1, "Description is required"),
        outDoorColor: z.string().min(1, "Outdoor color is required"),
        interiorColor: z.string().min(1, "Interior color is required"),
        fuelType: z.nativeEnum(fuelType, { errorMap: () => ({ message: "Invalid fuel type" }) }),
        fuelCapacity: z.string().min(1, "Fuel capacity is required"),
        kilometresData: z.string().min(1, "Kilometres data is required"),
        carSeatsNumber: z.number().min(1, "Car seats number must be at least 1"), // Changed to number
        transmission: z.enum(["Manual", "Automatic"], { errorMap: () => ({ message: "Invalid transmission type" }) }),
    })
})
export const CarsValidations = {
    CarsValidationSchema
};
