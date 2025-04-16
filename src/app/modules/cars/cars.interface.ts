import { Types } from "mongoose";
import { fuelType } from "../../../enums/fuel";


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
  protection: [string],
  agencyId: Types.ObjectId
  carModel: string,
};
