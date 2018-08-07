import { OverlayRef } from '@angular/cdk/overlay';

export class SlkGridFilterRef {
    constructor(private overlayRef: OverlayRef) { }

    close(): void {
        this.overlayRef.dispose();
    }
}
