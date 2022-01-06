import { PrizeTable } from "playa-iw";
import { translationService } from "playa-core";

/**
 * @export
 * @class ExtendedPrizeTable
 * @extends {PrizeTable}
 */
export class ExtendedPrizeTable extends PrizeTable {
    protected getPrizedescription(prizeDivision: any): string {
        let description;
        const division = prizeDivision;
        if (division > 0 && division <= 10) {
            description = translationService.getString(`paytable_COM.descriptionText1`);
        } else if (division > 10 && division <= 13) {
            description = translationService.getString(`paytable_COM.descriptionText2`);
        } else {
            description = translationService.getString(`paytable_COM.descriptionText3`);
        }
        return description;
    }
}
