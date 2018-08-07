import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    Subject,
    of as observableOf
} from 'rxjs';

export interface CacheContent {
    expiry?: number;
    data: any;
}

export const viewRefKey = 'view-ref';
export const viewRefContainer = 'view-ref-container';

export const dataNode = 'dataNode';

@Injectable()
export class ActionsService {
    private cache: Map<string, CacheContent> = new Map<string, CacheContent>();
    private inFlightObseravbles: Map<string, Subject<any>> = new Map<string, Subject<any>>();
    readonly DEFAULT_MAX_AGE: number = 300000;

    private addAction = new BehaviorSubject<any>(false);

    onAdd: Observable<any> = this.addAction.asObservable();
    onActChange(changes: any) {
        this.addAction.next(changes);
    }

    /**
     * This method is an observables based in-memory cache implementation
     * Keeps track of in flight observablesand sets a default expory for cached values
     */
    /**
     * Gets the value from the cache if the key is provided.
     * If no value exists in cache, then chcek if the call exists
     * in flight, if so return the subejct, If not create a new
     * Subject inFlightObservble and return the source obseravble.
     */
    get(key: string, fallback?: Observable<any>, maxAge?: number): Observable<any> | Subject<any> {
        if (this.hasValidCachedValue(key)) {
            return observableOf(this.cache.get(key).data);
        }

        if (!maxAge) {
            maxAge = this.DEFAULT_MAX_AGE;
        }

        if (this.inFlightObseravbles.has(key)) {
            return this.inFlightObseravbles.get(key);
        } else {
            return Observable.throw('Requested key is not available in the Cache');
        }
    }

    set(key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void {
        this.cache.set(key, { data: value, expiry: Date.now() + maxAge });
        this.notifyInFlightObservers(key, value);
    }
    /**
     * Checks if the key exists in cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }
    /**
     * Publishes the value to all observers of the given
     * in progress observables if observers exist.
     */
    private notifyInFlightObservers(key: string, value: any): void {
        if (this.inFlightObseravbles.has(key)) {
            const inFlight = this.inFlightObseravbles.get(key);
            const observersCount = inFlight.observers.length;
            if (observersCount) {
                inFlight.next(value);
            }
            inFlight.complete();
            this.inFlightObseravbles.delete(key);
        }
    }
    /**
     * Checks if key exists and has not expired
     */
    private hasValidCachedValue(key: string): boolean {
        if (this.cache.has(key)) {
            if (this.cache.get(key).expiry < Date.now()) {
                this.cache.delete(key);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }


}
