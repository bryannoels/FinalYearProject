import { BenjaminGrahamValue } from "./BenjaminGrahamValue";
import { DcfValue } from "./DcfValue";
import { DdmValue } from "./DdmValue";

export type IntrinsicValue = {
    DCF: DcfValue;
    DDM: DdmValue;
    BenjaminGraham: BenjaminGrahamValue;
}