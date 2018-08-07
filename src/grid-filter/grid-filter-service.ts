import {
    Injectable,
    ComponentRef,
    Injector,
    ElementRef,
} from '@angular/core';
import {
    Overlay,
    OverlayConfig,
    OverlayRef,
    OriginConnectionPosition,
    OverlayConnectionPosition
} from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { SlkGridPopupComponent } from '../grid-popup';
import { SlkGridFilterRef } from './grid-filter-ref';
import { OPTIONS_DIALOG_DATA } from './grid-filter-tokens';
import { BehaviorSubject, Observable } from 'rxjs';

// Each property can be overriden by the consumer
interface OptionsDialogConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    data?: any[];
}

const DEFAULT_CONFIG: OptionsDialogConfig = {
    hasBackdrop: true,
    backdropClass: 'no-style-backdrop',
    panelClass: 'slk-options-dialog-panel',
    data: []
};

@Injectable()
export class DomService {
    onClose: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // onCloseBehavior = observableOf(this.onClose);
    onCloseBehavior: Observable<any> = this.onClose.asObservable();

    constructor(
        private injector: Injector,
        private overlay: Overlay
    ) { }

    open(elementRef: ElementRef, config: any = {}) {
        // Over ride default configuration
        const dialogConfig = {
            ...DEFAULT_CONFIG,
            ...config
        };
        // Returns an OverlayRef (which is a PortalHost)
        const overlayRef = this.createOverlay(dialogConfig, elementRef);
        // Instantiate remote control
        const dialogRef = new SlkGridFilterRef(overlayRef);

        const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef);

        overlayRef.backdropClick().subscribe(_ => {
            this.onClose.next(true);
            dialogRef.close();
        });

        return dialogRef;
    }

    private createOverlay(config: OptionsDialogConfig, elementRef: ElementRef) {
        const overlayConfig = this.getOverlayConfig(config, elementRef);
        return this.overlay.create(overlayConfig);
    }

    private attachDialogContainer(overlayRef: OverlayRef, config: OptionsDialogConfig, dialogRef: SlkGridFilterRef) {
        const injector = this.createInjector(config, dialogRef);
        const containerPortal = new ComponentPortal(SlkGridPopupComponent, null, injector);
        const containerRef: ComponentRef<SlkGridPopupComponent<any>> = overlayRef.attach(containerPortal);
        return containerRef.instance;
    }

    private createInjector(
        config: OptionsDialogConfig,
        dialogRef: SlkGridFilterRef): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();

        // Set customs injection tokens
        injectionTokens.set(SlkGridFilterRef, dialogRef);
        injectionTokens.set(OPTIONS_DIALOG_DATA, config.data);

        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }

    private getOverlayConfig(config: OptionsDialogConfig, elementRef: ElementRef): OverlayConfig {
        // const positionStrategy = this.overlay.position()
        //     .global()
        //     .centerHorizontally()
        //     .centerVertically();
        const positionStrategy = this._getPosition(elementRef);
        // debugger;

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            panelClass: config.backdropClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy
        });
        // debugger;

        return overlayConfig;
    }

    _getPosition(elementRef: ElementRef): any {
        const origin = {
            topLeft: { originX: 'start', originY: 'top' } as OriginConnectionPosition,
            topRight: { originX: 'end', originY: 'top' } as OriginConnectionPosition,
            bottomLeft: { originX: 'start', originY: 'bottom' } as OriginConnectionPosition,
            bottomRight: { originX: 'end', originY: 'bottom' } as OriginConnectionPosition,
            topCenter: { originX: 'center', originY: 'top' } as OriginConnectionPosition,
            bottomCenter: { originX: 'center', originY: 'bottom' } as OriginConnectionPosition,
        };
        const overlay = {
            topLeft: { overlayX: 'start', overlayY: 'top' } as OverlayConnectionPosition,
            topRight: { overlayX: 'end', overlayY: 'top' } as OverlayConnectionPosition,
            bottomLeft: { overlayX: 'start', overlayY: 'bottom' } as OverlayConnectionPosition,
            bottomRight: { overlayX: 'end', overlayY: 'bottom' } as OverlayConnectionPosition,
            topCenter: { overlayX: 'center', overlayY: 'top' } as OverlayConnectionPosition,
            bottomCenter: { overlayX: 'center', overlayY: 'bottom' } as OverlayConnectionPosition,
        };

        return this.overlay.position()
            .connectedTo(elementRef, origin.bottomLeft, overlay.topLeft)
            .withOffsetY(10)
            .withDirection('rtl')
            .withFallbackPosition(origin.bottomRight, overlay.topRight)
            .withFallbackPosition(origin.topLeft, overlay.bottomLeft)
            .withFallbackPosition(origin.topRight, overlay.bottomRight)
            .withFallbackPosition(origin.topCenter, overlay.bottomCenter)
            .withFallbackPosition(origin.bottomCenter, overlay.topCenter);
    }
}
