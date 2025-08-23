/**
 * リアクティブ状態管理システム
 * Vue Composition API風のProxyベースアプローチで自動UI更新を実現
 */

export interface ReactiveOptions {
    immediate?: boolean; // 即座に更新するか
    batch?: boolean;     // バッチ更新するか
}

/**
 * リアクティブプロパティの変更を監視するクラス
 */
export class ReactiveSystem<T extends object> {
    private target: T;
    private watchers: Map<string, Array<() => void>> = new Map();
    private batchedUpdates: Set<() => void> = new Set();
    private batchTimeout: number | null = null;

    constructor(target: T, private options: ReactiveOptions = {}) {
        this.target = this.createReactiveProxy(target);
    }

    /**
     * オブジェクトをリアクティブなProxyでラップ
     */
    private createReactiveProxy(obj: T): T {
        return new Proxy(obj, {
            set: (target, property, value, receiver) => {
                const oldValue = Reflect.get(target, property);
                const result = Reflect.set(target, property, value, receiver);
                
                // 値が実際に変更された場合のみ通知
                if (oldValue !== value) {
                    this.notifyWatchers(property as string, value, oldValue);
                }
                
                return result;
            },
            get: (target, property, receiver) => {
                const value = Reflect.get(target, property, receiver);
                
                // SetやMapオブジェクトの場合、メソッドをラップ
                if (value instanceof Set) {
                    return this.wrapSet(value, property as string);
                } else if (value instanceof Map) {
                    return this.wrapMap(value, property as string);
                }
                
                return value;
            }
        });
    }

    /**
     * Setオブジェクトのメソッドをラップしてリアクティブ化
     */
    private wrapSet(set: Set<any>, propertyName: string): Set<any> {
        const self = this;
        
        return new Proxy(set, {
            get(target, prop) {
                const value = (target as any)[prop];
                
                if (typeof value === 'function') {
                    // Set変更メソッドのみをラップ
                    if (prop === 'add' || prop === 'delete' || prop === 'clear') {
                        return function(...args: any[]) {
                            const oldSet = new Set(target); // 変更前の状態をコピー
                            const result = value.apply(target, args);
                            console.log(`🔄 Set ${prop} detected: ${propertyName}, size: ${oldSet.size} → ${target.size}`);
                            self.notifyWatchers(propertyName, target, oldSet);
                            return result;
                        };
                    }
                    
                    // その他のメソッドは元のcontextで実行
                    return value.bind(target);
                }
                
                return value;
            }
        });
    }

    /**
     * Mapオブジェクトのメソッドをラップしてリアクティブ化
     */
    private wrapMap(map: Map<any, any>, propertyName: string): Map<any, any> {
        const self = this;
        
        return new Proxy(map, {
            get(target, prop) {
                const value = (target as any)[prop];
                
                if (typeof value === 'function') {
                    // Map変更メソッドのみをラップ
                    if (prop === 'set' || prop === 'delete' || prop === 'clear') {
                        return function(...args: any[]) {
                            const oldMap = new Map(target); // 変更前の状態をコピー
                            const result = value.apply(target, args);
                            console.log(`🔄 Map ${prop} detected: ${propertyName}, size: ${oldMap.size} → ${target.size}`);
                            self.notifyWatchers(propertyName, target, oldMap);
                            return result;
                        };
                    }
                    
                    // その他のメソッド（values, keys, entries等）は元のcontextで実行
                    return value.bind(target);
                }
                
                return value;
            }
        });
    }

    /**
     * 特定プロパティの変更を監視
     */
    watch(property: string | string[], callback: () => void): () => void {
        const properties = Array.isArray(property) ? property : [property];
        
        properties.forEach(prop => {
            if (!this.watchers.has(prop)) {
                this.watchers.set(prop, []);
            }
            this.watchers.get(prop)!.push(callback);
        });

        // アンサブスクライブ関数を返す
        return () => {
            properties.forEach(prop => {
                const callbacks = this.watchers.get(prop);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            });
        };
    }

    /**
     * 全プロパティの変更を監視
     */
    watchAll(callback: () => void): () => void {
        return this.watch('*', callback);
    }

    /**
     * プロパティ変更時の通知
     */
    private notifyWatchers(property: string, newValue: any, oldValue: any): void {
        const callbacks = new Set<() => void>();
        
        // 特定プロパティのウォッチャー
        const propertyCallbacks = this.watchers.get(property);
        if (propertyCallbacks) {
            propertyCallbacks.forEach(cb => callbacks.add(cb));
        }
        
        // 全体ウォッチャー
        const allCallbacks = this.watchers.get('*');
        if (allCallbacks) {
            allCallbacks.forEach(cb => callbacks.add(cb));
        }

        if (this.options.batch) {
            // バッチ更新
            callbacks.forEach(cb => this.batchedUpdates.add(cb));
            this.scheduleBatchUpdate();
        } else {
            // 即座に更新
            callbacks.forEach(cb => {
                try {
                    cb();
                } catch (error) {
                    console.error('ReactiveSystem watcher error:', error);
                }
            });
        }

        console.log(`🔄 Reactive: ${property} changed from`, oldValue, 'to', newValue);
    }

    /**
     * バッチ更新のスケジューリング
     */
    private scheduleBatchUpdate(): void {
        if (this.batchTimeout) {
            return;
        }

        this.batchTimeout = window.setTimeout(() => {
            this.executeBatchUpdate();
            this.batchTimeout = null;
        }, 0);
    }

    /**
     * バッチ更新の実行
     */
    private executeBatchUpdate(): void {
        const updates = Array.from(this.batchedUpdates);
        this.batchedUpdates.clear();

        updates.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('ReactiveSystem batch update error:', error);
            }
        });

        console.log(`🔄 Reactive: Executed ${updates.length} batched updates`);
    }

    /**
     * リアクティブオブジェクトを取得
     */
    getReactive(): T {
        return this.target;
    }

    /**
     * すべてのウォッチャーを削除
     */
    destroy(): void {
        this.watchers.clear();
        this.batchedUpdates.clear();
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
    }
}

/**
 * computed値を作成するヘルパー
 */
export function computed<T>(getter: () => T): () => T {
    let cachedValue: T;
    let dirty = true;
    
    return () => {
        if (dirty) {
            cachedValue = getter();
            dirty = false;
        }
        return cachedValue;
    };
}

/**
 * リアクティブオブジェクトを作成するヘルパー関数
 */
export function reactive<T extends object>(target: T, options?: ReactiveOptions): ReactiveSystem<T> {
    return new ReactiveSystem(target, options);
}