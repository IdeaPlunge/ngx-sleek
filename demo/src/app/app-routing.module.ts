import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { TreeComponent } from './tree/tree';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'getting-started',
        component: GettingStartedComponent
        // loadChildren: 'app/getting-started/getting-started.module#GettingStartedModule'
    },
    {
        path: 'tree',
        component: TreeComponent
        // loadChildren: 'app/getting-started/getting-started.module#GettingStartedModule'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
