import {
    Component,
    Injectable,
    AfterViewInit
} from '@angular/core';
import { of as observableOf, BehaviorSubject } from 'rxjs';
import { NestedTreeControl } from 'ngx-sleek';

export class INode {
    children: INode[];
    filename: string;
    type: any;
}

const TREE_DATA = JSON.stringify({
    Applications: {
        Calendar: 'app',
        Chrome: 'app',
        Webstorm: 'app'
    },
    Documents: {
        angular: {
            src: {
                compiler: 'ts',
                core: 'ts'
            }
        },
        material2: {
            src: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts'
            }
        }
    },
    // Downloads: {
    //   October: 'pdf',
    //   November: 'pdf',
    //   Tutorial: 'html'
    // },
    // Pictures: {
    //   'Photo Booth Library': {
    //     Contents: 'dir',
    //     Pictures: 'dir'
    //   },
    //   Sun: 'png',
    //   Woods: 'jpg'
    // }
});

@Injectable()
export class Database {
    dataChange = new BehaviorSubject<any[]>([]);

    get data(): any[] { return this.dataChange.value; }
    constructor() { this.initialize(); }
    initialize() {
        const dataObject = JSON.parse(TREE_DATA);
        // console.log('dataObj', dataObject);
        const data = this.buildTree(dataObject, 0);
        // console.log('data', data);
        this.dataChange.next(data);
    }


    buildTree(obj: object, level: number): any[] {
        return Object.keys(obj).reduce<any[]>((accumulator, key) => {
            const value = obj[key];
            // console.log('value', value);
            const node = new INode();
            node.filename = key;

            if (value !== null) {
                if (typeof value === 'object') {
                    node.children = this.buildTree(value, level + 1);
                } else {
                    node.type = key;
                }
            }
            // console.log('node', node);
            return accumulator.concat(node);
        }, []);
    }
}

@Component({
    selector: 'app-tree',
    templateUrl: 'tree.html',
    styleUrls: ['tree.scss'],
    providers: [Database]
})
export class TreeComponent implements AfterViewInit {
    nestedTreeControl: NestedTreeControl<INode>;
    dataSource: any;

    constructor(dataBase: Database) {
        this.nestedTreeControl = new NestedTreeControl<INode>(this._getChildren);
        dataBase.dataChange.subscribe(data => {
            console.log('this.dataSource', data);
            this.dataSource = data;
        });
    }
    hasNestedChild = (_: number, nodeData: INode) => {
        return !nodeData.type;
    }
    private _getChildren = (node: INode) => {
        return observableOf(node.children);
    }

    reorderData(event: any) {
        // console.log('event', event);
    }

    ngAfterViewInit() { }
}
