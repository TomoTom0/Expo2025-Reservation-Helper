/**
 * 入場予約UI更新ヘルパー関数
 * 循環参照を避けるために独立したモジュールとして分離
 */

import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// メインFABボタンの表示を更新（統一システムに委譲）
export function updateMainButtonDisplay(): void {
    // カウントダウン中はログを削減
    if (!false) {
        // ログ削減: 頻繁に呼ばれるため削除
    }
    entranceReservationStateManager.updateFabDisplay();
}


