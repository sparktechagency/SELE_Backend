import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICars } from "./cars.interface";
import { CarsModel } from "./cars.model";
// create car
const createCarIntoDB = async (payload: ICars, userId: string) => {
    const car = await CarsModel.create({ ...payload, userId });
    if (!car) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create car');
    }
    return car;
};

// get all car
const getAllCarsFromDB = async (filters: any) => {
    const query: any = {};
    // Price filtering
    if (filters.price) {
        query.price = {};
        if (filters.price.gte) query.price.$gte = Number(filters.price.gte);
        if (filters.price.lte) query.price.$lte = Number(filters.price.lte);
    }
    // Kilometres filtering
    if (filters.kilometresData) {
        const kmValue = Number(filters.kilometresData);
        if (!isNaN(kmValue)) {
            query.kilometresData = kmValue;
        }
    }
    // Brand Name filtering
    if (filters.brandName) {
        query.brandName = filters.brandName;
    }
    // Transmission filtering
    if (filters.transmission) {
        query.transmission = filters.transmission;
    }

    // category filtering
    if (filters.category) {
        query.category = filters.category;
    }
   
    const cars = await CarsModel.find(query).populate({
        path: "brandName",
        select: "brandName -_id"
    }).populate({
        path: "category",
        select: "category -_id"
    }).lean();
    if (!cars) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch cars');
    }


    const modifiedCars = cars.map(car => ({
        ...car,
        // @ts-ignore
        brandName: car.brandName?.brandName || null,
        // @ts-ignore
        category: car.category?.category || null
      }));

    return modifiedCars;
};



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
