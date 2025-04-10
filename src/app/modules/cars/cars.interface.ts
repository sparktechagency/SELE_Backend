import { Types } from "mongoose";
import { fuelType } from "../../../enums/fuel";
import { category } from "../../../enums/category";


export type ICars = {
  title: string,
  carImage: string,
  brandName: Types.ObjectId,
  description: string,
  price: number,
  outDoorColor: string,
  interiorColor: string,
  fuelType: fuelType,
  fuelCapacity: string,
  kilometresData: string,
  category:Types.ObjectId,
  carSeatsNumber: number,
  transmission: "Manual" | "Automatic",
};
