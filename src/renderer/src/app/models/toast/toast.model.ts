import { Uuid } from "../../core/types";
import { PositionToast, TypeToast } from "../../enums";

export interface Toast {
    id: Uuid,
    position: PositionToast,
    title?: string,
    message: string,
    autoCloseTime: number,
    canClose: boolean,
    pauseOnHover: boolean,
    type: TypeToast
}
