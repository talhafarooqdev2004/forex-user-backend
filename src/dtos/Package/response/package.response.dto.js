export class PackageIndexResponseDTO {
    id;
    price;
    durationHours;
    freeTrialHours
    translation;

    constructor(packageModel) {
        this.id = parseInt(packageModel.id);
        this.price = parseFloat(packageModel.price);
        this.durationHours = packageModel.duration_hours;
        this.freeTrialHours = packageModel.free_trial_hours;

        this.translation = {
            name: packageModel.translation.name,
            detail: packageModel.translation.detail
        };
    }

    static fromModel(packageModel) {
        return new this(packageModel);
    }
}