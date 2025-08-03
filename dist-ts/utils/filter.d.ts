/**
 * 検索フィルタ処理ユーティリティ
 */
import type { FilterCriteria, FilterToken } from '@/types';
export declare class FilterEngine {
    /**
     * 検索文字列を正規表現フィルタに変換
     *
     * 対応する検索形式:
     * 1. 通常の文字列（AND検索）
     * 2. マイナス検索（-word で除外）
     * 3. フレーズ検索（"phrase" で完全一致）
     * 4. OR検索（word1 or word2）
     * 5. ワイルドカード（* で0文字以上）
     * 6. 括弧によるグループ化
     */
    static prepareFilter(searchText: string): FilterCriteria;
    /**
     * OR条件の処理
     */
    private static processOrConditions;
    /**
     * フィルタ条件をテキストに適用
     */
    static applyFilter(text: string, criteria: FilterCriteria): boolean;
    /**
     * 検索トークンを解析（デバッグ用）
     */
    static parseTokens(searchText: string): FilterToken[];
}
//# sourceMappingURL=filter.d.ts.map