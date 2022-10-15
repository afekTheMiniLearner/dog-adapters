import { IDog, IDogQuery, IFilterResult } from '../interfaces/dog.interface';
import { DogModel } from '../models';
import { filterDogsAggregation } from '../aggregations/filterDogs.aggregations';
import logger from '../utils/logger';

export async function getDogById(
    requestId: string,
    dogId: string
): Promise<IDog | undefined> {
    logger.debug(requestId, 'db is finding dog by dogId', { dogId });
    const dogDoc: any = await DogModel.findById(dogId);

    return dogDoc?.toJSON() as unknown as IDog | undefined;
}

export async function updateDog(
    dogId: string,
    dog: IDog
): Promise<IDog | undefined> {
    const dogDoc: any = await DogModel.findOneAndUpdate(
        { _id: dogId },
        { $set: dog },
        { new: true }
    );

    return dogDoc?.toJSON();
}

export async function validateOwner(
    ownerId: string,
    dogId: string
): Promise<boolean> {
    const isDogOwnerExist = await DogModel.findOne({
        _id: dogId,
        owner: ownerId,
    }).select('_id owner');

    return !!isDogOwnerExist;
}

export async function createNewDog(dog: IDog): Promise<IDog> {
    const dogDoc = new DogModel(dog);
    const res: any = await dogDoc.save();

    return res.toJSON();
}

export async function filteredDogsFromQuery(
    query: IDogQuery
): Promise<IFilterResult> {
    const aggregation = filterDogsAggregation(query);
    const [result]: any = await DogModel.aggregate(aggregation);
    const {
        pagination: [
            pagination = {
                page: query.page,
                itemsPerPage: query.itemsPerPage,
                totalItems: 0,
                totalPages: 0,
            },
        ],
        data,
    } = result;
    return { pagination, data };
}

export async function deleteDogById(dogId: string): Promise<boolean> {
    const { deletedCount }: any = await DogModel.deleteOne({
        _id: dogId,
    });

    return deletedCount === 1;
}
