class QueryBuilder {
    queryModel: any;
    query: any;

    constructor(queryModel: any, query: Record<string, any>) {
        this.queryModel = queryModel;
        this.query = query;
    }

    search(searchableFields: string[]) {
        if (this?.query.searchTerm) {
            this.queryModel = this.queryModel.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: this?.query?.searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }

    filter() {
        const queryObj = { ...this.query };
        const excludedFields = ['page', 'limit', 'sort', 'searchTerm', 'minPrice', 'maxPrice'];
        excludedFields.forEach((el) => delete queryObj[el]);

        if (this.query.minPrice || this.query.maxPrice) {
            queryObj.price = {};
            if (this.query.minPrice) {
                queryObj.price.$gte = Number(this.query.minPrice);
            }
            if (this.query.maxPrice) {
                queryObj.price.$lte = Number(this.query.maxPrice);
            }
        }
        
        this.queryModel = this.queryModel.find(queryObj);
        return this;
    }

    sort(defaultField = 'createdAt') {
        if (this.query.sort) {
            const sortOrder = this.query.sort === 'asc' ? 1 : -1;
            this.queryModel = this.queryModel.sort({ [defaultField]: sortOrder });
        } else {
            // Default sorting (newest to oldest)
            this.queryModel = this.queryModel.sort({ [defaultField]: -1 });
        }
        return this;
    }
    

    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.queryModel = this.queryModel.skip(skip).limit(limit);
        return this;
    }

    async getPaginationInfo() {
        const total = await this.queryModel.model.countDocuments(this.queryModel.getQuery());
        const limit = Number(this.query.limit) || 10;
        const totalPage = Math.ceil(total / limit);
        const page = Number(this.query.page) || 1;

        return {
            total,
            totalPage,
            page,
            limit
        };
    }
}

export default QueryBuilder;