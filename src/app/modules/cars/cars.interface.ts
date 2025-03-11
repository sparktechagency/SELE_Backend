import { fuelType } from "../../../enums/fuel";


export type ICars = {
  carImage: string,
  brandName: string,
  description: string,
  outDoorColor: string,
  interiorColor: string,
  fuelType: fuelType,
  fuelCapacity: string,
  kilometresData: string,
  carSeatsNumber: number,
  transmission: "Manual" | "Automatic",
  price: number,
  ProtectionPlan: string[]
};
