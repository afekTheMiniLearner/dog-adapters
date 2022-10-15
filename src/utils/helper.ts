export function errorClassify_IsInvalidObjectId(errMsg: string) {
    return /Cast to ObjectId failed for value "\w+" (type string) at path "_id" for model "\w+"/.test(
        errMsg
    );
}
