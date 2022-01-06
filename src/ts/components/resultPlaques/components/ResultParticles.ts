import { EmitterBaseComponent, ComponentConstr } from "playa-core";
import { IWProps } from "playa-iw";

/**
 * ResultParticles
 */
export class ResultParticles extends EmitterBaseComponent {
    public constructor(parentProps: IWProps, layoutId: string, assetIds: string[], waitsFor: ComponentConstr[] = []) {
        super(parentProps as any, layoutId, assetIds, waitsFor);
    }
}
