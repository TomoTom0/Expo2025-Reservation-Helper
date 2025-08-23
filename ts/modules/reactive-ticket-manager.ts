/**
 * リアクティブチケット管理システム
 * TicketManagerをラップしてVue風の自動UI更新を提供
 */

import { TicketManager, TicketData } from './ticket-manager';
import { ReactiveSystem } from './reactive-system';

export class ReactiveTicketManager {
    private ticketManager: TicketManager;
    private reactiveSystem: ReactiveSystem<TicketManager>;
    private uiUpdaters: Map<string, () => void> = new Map();

    constructor(ticketManager: TicketManager) {
        this.ticketManager = ticketManager;
        this.reactiveSystem = new ReactiveSystem(ticketManager, {
            batch: true // バッチ更新でパフォーマンス向上
        });
        
        this.setupUIUpdaters();
    }

    /**
     * UI更新関数を設定
     */
    private setupUIUpdaters(): void {
        // チケット選択関連のUI更新をまとめて実行
        this.reactiveSystem.watch('selectedTicketIds', () => {
            console.log('🔄 ReactiveTicketManager: selectedTicketIds changed');
            this.executeUIUpdates('ticketSelection');
        });

        // チケット一覧関連のUI更新
        this.reactiveSystem.watch('tickets', () => {
            console.log('🔄 ReactiveTicketManager: tickets changed');
            this.executeUIUpdates('ticketList');
        });
    }

    /**
     * UI更新関数を登録
     */
    registerUIUpdater(key: string, updater: () => void): void {
        this.uiUpdaters.set(key, updater);
        console.log(`✅ ReactiveTicketManager: UI updater registered for ${key}`);
    }

    /**
     * 複数のUI更新関数をまとめて登録
     */
    registerUIUpdaters(updaters: Record<string, () => void>): void {
        Object.entries(updaters).forEach(([key, updater]) => {
            this.registerUIUpdater(key, updater);
        });
    }

    /**
     * UI更新を実行
     */
    private executeUIUpdates(category: string): void {
        const updater = this.uiUpdaters.get(category);
        if (updater) {
            try {
                updater();
                console.log(`✅ ReactiveTicketManager: UI updated for ${category}`);
            } catch (error) {
                console.error(`❌ ReactiveTicketManager: UI update error for ${category}:`, error);
            }
        }
    }

    /**
     * リアクティブなTicketManagerを取得
     */
    getReactiveManager(): TicketManager {
        return this.reactiveSystem.getReactive();
    }

    /**
     * 元のTicketManagerを取得（非リアクティブ）
     */
    getOriginalManager(): TicketManager {
        return this.ticketManager;
    }

    // TicketManagerの主要メソッドをプロキシ
    async loadAllTickets(): Promise<TicketData[]> {
        return this.getReactiveManager().loadAllTickets();
    }

    async addExternalTicket(ticketId: string, label: string): Promise<void> {
        return this.getReactiveManager().addExternalTicket(ticketId, label);
    }

    selectTicketsByDate(date: string, ownOnly?: boolean): void {
        this.getReactiveManager().selectTicketsByDate(date, ownOnly);
    }

    getSelectedTicketIds(): Set<string> {
        return this.getReactiveManager().getSelectedTicketIds();
    }

    getSelectedTickets(): TicketData[] {
        return this.getReactiveManager().getSelectedTickets();
    }

    getSelectedTicketCount(): number {
        return this.getReactiveManager().getSelectedTicketCount();
    }

    getAllTickets(): TicketData[] {
        return this.getReactiveManager().getAllTickets();
    }

    getAvailableDates(): string[] {
        return this.getReactiveManager().getAvailableDates();
    }

    clearSelection(): void {
        this.getReactiveManager().clearSelection();
    }

    toggleTicketSelection(ticketId: string): boolean {
        return this.getReactiveManager().toggleTicketSelection(ticketId);
    }

    syncCacheData(): void {
        this.getReactiveManager().syncCacheData();
    }

    /**
     * リアクティブシステムを破棄
     */
    destroy(): void {
        this.reactiveSystem.destroy();
        this.uiUpdaters.clear();
        console.log('🧹 ReactiveTicketManager destroyed');
    }
}

/**
 * グローバルリアクティブチケットマネージャーインスタンス
 */
let globalReactiveTicketManager: ReactiveTicketManager | null = null;

/**
 * リアクティブチケットマネージャーを初期化・取得
 */
export function getReactiveTicketManager(ticketManager?: TicketManager): ReactiveTicketManager {
    if (!globalReactiveTicketManager) {
        if (!ticketManager) {
            throw new Error('ReactiveTicketManager requires initial TicketManager instance');
        }
        globalReactiveTicketManager = new ReactiveTicketManager(ticketManager);
        console.log('🔄 ReactiveTicketManager initialized');
    }
    return globalReactiveTicketManager;
}