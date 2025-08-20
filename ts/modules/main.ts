/**
 * メインエントリーポイント
 * 各sectionモジュールをimportすることで、webpackで統合されたバンドルを作成
 */

// すべてのモジュールをimport（副作用importも含む）
import './pavilion-search-page';
import './entrance-page-init';
import './entrance-page-state';
import './cache-manager';
import './entrance-page-dom-utils';
import './entrance-page-core';
import './entrance-page-fab';
import './app-router';
import './companion-ticket-page'; // 同行者追加機能
import './automation-init'; // 自動操作エンジン初期化

// 新しい監視・即時予約機能
import './monitoring-scheduler';
import './monitoring-cache';
import './monitoring-service';
import './immediate-reservation';
import './notification-system'; // グローバル通知システム

// テスト環境・開発環境でのみtest-exportsをimport
// 本番環境では webpack の tree shaking で除外される
if (process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'test') {
    import('./test-exports').then(() => {
        console.log('🧪 テスト用exports読み込み完了');
    }).catch(err => {
        console.warn('テスト用exports読み込み失敗:', err);
    });
}
