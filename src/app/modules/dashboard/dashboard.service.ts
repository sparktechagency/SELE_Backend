import { User } from "../user/user.model"

const dashboardStatisticsIntoDB = async()=>{
    const totalUser = await User.countDocuments({role:"USER"})
    const totalAgency = await User.countDocuments({role:'AGENCY'})
    return {
        totalUser,
        totalAgency
    }
}


export const DashboardService = {
     dashboardStatisticsIntoDB
}