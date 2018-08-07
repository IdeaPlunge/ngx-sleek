import {
    OnDestroy,
    Input,
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    AfterContentChecked,
    OnInit,
    IterableDiffer,
    TrackByFunction,
    ViewChild,
    ContentChildren,
    IterableDiffers,
    ChangeDetectorRef,
    ViewContainerRef,
    IterableChangeRecord,
    QueryList,
    HostBinding,
    EmbeddedViewRef,
    EventEmitter,
    Output
} from '@angular/core';
import { Subject, Observable, of as observableOf, Subscription, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { SlkTreeNodeDefDirective, SlkTreeNodeOutletContext } from './node';
import { SlkTreeNodeOutletDirective } from './outlet';
import { TreeControl } from './control/tree-control';
import { SlkTreeTextOutletDirective } from './tree-nest-outlet';
import { SlkTreeNodeDirective } from './node-directive';


/**
 * Slk tree component that connects with a data source to retrieve data of type T and
 * renders dataNodes with heirarchy.
 */
@Component({
    selector: 'slk-tree',
    exportAs: 'slkTree',
    template: '<ng-container slkTreeNodeOutlet></ng-container>',
    styleUrls: ['tree.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlkTreeComponent<T> implements
    AfterContentChecked, CollectionViewer, OnDestroy, OnInit {

    /** Subject that emits when the component has been destroyed. */
    private _onDestroy = new Subject<void>();
    /** Differ used to find the changes in the data provided by the data source. */
    private _dataDiffer: IterableDiffer<T>;
    /** Stores the node definition that does not have a when predicate. */
    public _defaultNodeDef: SlkTreeNodeDefDirective<T> | null;
    /** Data subscription */
    private _dataSubscription: Subscription | null;
    /** Level of nodes */
    private _levels: Map<T, number> = new Map<T, number>();

    // public viewRef: ViewRef;
    public embeddedViewRef: EmbeddedViewRef<any>;
    public cacheEmbeddedViewRef: EmbeddedViewRef<any>[] = [];

    public viewContainerRef: Array<any> = [];

    @HostBinding('class') class = 'slk-tree';

    /**
     * Provides a stream containing the latest data array to render. Influenced
     * by the tree's stream of view window.
     */
    @Input()
    get dataSource(): DataSource<T> | Observable<T[]> | T[] {
        return this._dataSource;
    }
    set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        // console.log('dataSource', dataSource);
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    private _dataSource: DataSource<T> | Observable<T[]> | T[];
    /** the tree controller. */
    @Input() treeControl: TreeControl<T>;
    /**
     * Tracking function will be used to check differences in data changes.
     */
    @Input() trackBy: TrackByFunction<T>;

    /** Sends the re-ordered array on drop. */
    @Output('reorderData') reorderData: EventEmitter<any> = new EventEmitter();

    // @ViewChildren(SlkNestedTreeNodeDirective) public nestedTreeNode: SlkNestedTreeNodeDirective<T>;

    // Outlets within the tree's template where the dataNodes will be inserted.
    @ViewChild(SlkTreeNodeOutletDirective) _nodeOutlet: SlkTreeNodeOutletDirective;
    /** The tree node template for the tree. */
    @ContentChildren(SlkTreeNodeDefDirective) _nodeDefs: QueryList<SlkTreeNodeDefDirective<T>>;
    /** Stream containing the latest info on what rows are being displayed on screen. */
    viewChange = new BehaviorSubject<{ start: number, end: number }>({ start: 0, end: Number.MAX_VALUE });

    constructor(
        private _differs: IterableDiffers,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }
    ngOnInit() {
        this._dataDiffer = this._differs.find([]).create(this.trackBy);
    }

    ngOnDestroy() {
        this._nodeOutlet.viewContainer.clear();

        this._onDestroy.next();
        this._onDestroy.complete();

        if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }

        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
    }

    ngAfterContentChecked() {
        const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
        // console.log('defaultnodedef', defaultNodeDefs);

        this._defaultNodeDef = defaultNodeDefs[0];

        if (this.dataSource && this._nodeDefs && !this._dataSubscription) {
            // console.log('enter');
            this._observeRenderChanges();
        }
    }

    private _switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }
        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
        // Remove all dataNodes if there is now no data source
        if (!dataSource) {
            this._nodeOutlet.viewContainer.clear();
        }
        this._dataSource = dataSource;
        if (this._nodeDefs) {
            this._observeRenderChanges();
        }
    }

    /** Set up a subscription for the data provided by the data source. */
    private _observeRenderChanges() {
        let dataStream: Observable<T[]> | undefined;

        if (typeof (this._dataSource as DataSource<T>).connect === 'function') {
            dataStream = (this._dataSource as DataSource<T>).connect(this);
        } else if (this._dataSource instanceof Observable) {
            dataStream = this._dataSource;
        } else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }
        // console.log('dataStream', dataStream);
        if (dataStream) {
            this._dataSubscription = dataStream.pipe(takeUntil(this._onDestroy))
                .subscribe(data => this._renderNodeChanges(data));
        }
    }

    /** Check for changes made in the data nd render each change. */
    _renderNodeChanges(data: T[], dataDiffer: IterableDiffer<T> = this._dataDiffer,
        viewContainer: ViewContainerRef = this._nodeOutlet.viewContainer,
        parentData?: T) {

        const changes = dataDiffer.diff(data);
        // console.log('changes', changes);

        if (!changes) { return; }

        changes.forEachOperation(
            (item: IterableChangeRecord<T>, adjustedPreviousIndex: number, currentIndex: number) => {
                // console.log('tes', item, adjustedPreviousIndex, currentIndex);
                // console.log('currentIndex', currentIndex);
                if (item.previousIndex === null) {
                    this.insertNode(data[currentIndex], currentIndex, viewContainer, parentData);
                } else if (currentIndex === null) {
                    viewContainer.remove(adjustedPreviousIndex);
                } else {
                    const view = viewContainer.get(adjustedPreviousIndex);
                    viewContainer.move(view, currentIndex);
                }
            });
        this._changeDetectorRef.detectChanges();
    }

    /**
     * finds the matchin node defintion that should be used for this node data
     */
    _getNodeDef(data: T, i: number): SlkTreeNodeDefDirective<T> {
        if (this._nodeDefs.length === 1) { return this._nodeDefs.first; }
        const nodeDef = this._nodeDefs.find(def => def.when && def.when(i, data)) || this._defaultNodeDef;

        return nodeDef;
    }

    /**
     * Create the embedded view for the data node template and place it in the correct index
     * within the data node view container.
     */
    insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef, parentData?: T) {
        const node = this._getNodeDef(nodeData, index);

        /** Gets all the view container ref to check the index of view ref for drag and drop. */
        this.viewContainerRef.push(viewContainer);

        // Node context that will be provided to created embedded view
        const context = new SlkTreeNodeOutletContext<T>(nodeData);

        // If tree is flat tree, then use the getLevel function in flat tree control
        if (this.treeControl.getLevel) {
            context.level = this.treeControl.getLevel(nodeData);
        } else if (typeof parentData !== 'undefined' && this._levels.has(parentData)) {
            context.level = this._levels.get(parentData) + 1;
        } else {
            context.level = 0;
        }

        this._levels.set(nodeData, context.level);

        // Use default tree nodeOutlet, or nested node;s nodeOutlet
        const container = viewContainer ? viewContainer : this._nodeOutlet.viewContainer;

        /** Returns a view ref and store it in property. */
        this.embeddedViewRef = container.createEmbeddedView(node.template, context, index);

        /** Gets all the view ref to check with the view container ref for drag and drop. */
        this.cacheEmbeddedViewRef.push(this.embeddedViewRef);

        if (SlkTreeNodeDirective.mostRecentTreeNode) {
            SlkTreeNodeDirective.mostRecentTreeNode.data = nodeData;
        }
        if (SlkTreeTextOutletDirective.mostRecentTreeTextOutlet) {
            SlkTreeTextOutletDirective.mostRecentTreeTextOutlet.data = nodeData;
            SlkTreeTextOutletDirective.mostRecentTreeTextOutlet.context = this.embeddedViewRef.context;
        }
    }

    /** Emits a event for re ordered data. */
    public reorderedData(data: any[]) {
        this.reorderData.emit(data);
    }
}


