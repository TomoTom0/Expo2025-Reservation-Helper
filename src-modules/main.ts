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
import './entrance-page-monitor';
import './entrance-page-ui';
import './entrance-page-fab';
import './app-router';
import './companion-ticket-page'; // 同行者追加機能
