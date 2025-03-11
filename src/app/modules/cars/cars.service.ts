import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICars } from "./cars.interface";
import { CarsModel } from "./cars.model";
// create car
const createCarIntoDB = async (payload: ICars) => {
    const car = await CarsModel.create(payload);
    if (!car) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create car');
    }
    return car;
}
// get all car
const getAllCarsFromDB = async () => {
    const cars = await CarsModel.find({});
    if (!cars) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch cars');
    }
    return cars;
}


// get car by id
const getSingleCarFromDB = async (id: string) => {
    const car = await CarsModel.findById(id);
    if (!car) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Car not found");
    }
    return car;
}

// update car
const updateCarIntoDB = async (id: string, payload: Partial<ICars>) => {
    const car = await CarsModel.findByIdAndUpdate(id, payload, { new: true });
    if (!car) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Car not found");
    }
    return car;
}

// delete car
const deleteCarFromDB = async (id: string) => {
    const car = await CarsModel.findByIdAndDelete(id);
    if (!car) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Car not found");
    }
    return car;
}


export const CarsServices = {
    createCarIntoDB,
    getAllCarsFromDB,
    getSingleCarFromDB,
    updateCarIntoDB,
    deleteCarFromDB,
};
