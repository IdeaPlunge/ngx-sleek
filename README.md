<p align="center">
  <img height="256px" width="256px" style="text-align: center;" src="https://cdn.rawgit.com/ygchander/ngx-sleek/master/demo/src/assets/logo.svg">
</p>

# ngx-sleek - Sleek Angular Components

[![npm version](https://badge.fury.io/js/ngx-sleek.svg)](https://badge.fury.io/js/ngx-sleek),
[![Build Status](https://travis-ci.org/ygchander/ngx-sleek.svg?branch=master)](https://travis-ci.org/ygchander/ngx-sleek)
[![Coverage Status](https://coveralls.io/repos/github/ygchander/ngx-sleek/badge.svg?branch=master)](https://coveralls.io/github/ygchander/ngx-sleek?branch=master)
[![dependency Status](https://david-dm.org/ygchander/ngx-sleek/status.svg)](https://david-dm.org/ygchander/ngx-sleek)
[![devDependency Status](https://david-dm.org/ygchander/ngx-sleek/dev-status.svg?branch=master)](https://david-dm.org/ygchander/ngx-sleek#info=devDependencies)
[![Greenkeeper Badge](https://badges.greenkeeper.io/ygchander/ngx-sleek.svg)](https://greenkeeper.io/)

## Demo

View all the directives in action at https://ygchander.github.io/ngx-sleek

## Dependencies
* [Angular](https://angular.io) (*requires* Angular 2 or higher, tested with 2.0.0)

## Installation
Install above dependencies via *npm*. 

Now install `ngx-sleek` via:
```shell
npm install --save ngx-sleek
```

---
##### SystemJS
>**Note**:If you are using `SystemJS`, you should adjust your configuration to point to the UMD bundle.
In your systemjs config file, `map` needs to tell the System loader where to look for `ngx-sleek`:
```js
map: {
  'ngx-sleek': 'node_modules/ngx-sleek/bundles/ngx-sleek.umd.js',
}
```
---

Once installed you need to import the main module:
```js
import { LibModule } from 'ngx-sleek';
```
The only remaining part is to list the imported module in your application module. The exact method will be slightly
different for the root (top-level) module for which you should end up with the code similar to (notice ` LibModule .forRoot()`):
```js
import { LibModule } from 'ngx-sleek';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [LibModule.forRoot(), ...],  
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Other modules in your application can simply import ` LibModule `:

```js
import { LibModule } from 'ngx-sleek';

@NgModule({
  declarations: [OtherComponent, ...],
  imports: [LibModule, ...], 
})
export class OtherModule {
}
```

## Usage



## License

Copyright (c) 2018 ideaplunge. Licensed under the MIT License (MIT)

