/**
 * パビリオン検索機能のテスト
 * 実際のindex.jsのprepare_filter関数をテスト
 */

const { prepare_filter } = require('../src/index.js');

describe('パビリオン検索機能', () => {
    describe('基本検索', () => {
        test('空文字列は全てにマッチ', () => {
            const filter = prepare_filter('');
            expect(filter.include.test('')).toBe(true);
            expect(filter.include.test('任意のテキスト')).toBe(true);
            expect(filter.exclude).toBe(null);
        });

        test('単一単語の部分マッチ', () => {
            const filter = prepare_filter('パビリオン');
            expect(filter.include.test('トヨタパビリオン')).toBe(true);
            expect(filter.include.test('レストラン')).toBe(false);
        });

        test('大文字小文字を区別しない', () => {
            const filter = prepare_filter('toyota');
            expect(filter.include.test('TOYOTA')).toBe(true);
            expect(filter.include.test('Toyota')).toBe(true);
            expect(filter.include.test('toyota')).toBe(true);
        });
    });

    describe('AND検索', () => {
        test('AND検索（順不同）マッチ', () => {
            const filter = prepare_filter('トヨタ パビリオン');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true);
            expect(filter.include.test('パビリオン・トヨタ・モビリティ')).toBe(true);
        });

        test('AND検索の非マッチ', () => {
            const filter = prepare_filter('トヨタ 日本');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(false);
            expect(filter.include.test('日本館')).toBe(false);
        });

        test('3つの単語のAND検索', () => {
            const filter = prepare_filter('トヨタ モビリティ パビリオン');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true);
            expect(filter.include.test('パビリオン・モビリティ・トヨタ')).toBe(true);
            expect(filter.include.test('トヨタ・パビリオン')).toBe(false); // モビリティがない
        });
    });

    describe('OR検索', () => {
        test('OR検索の左側マッチ', () => {
            const filter = prepare_filter('トヨタ OR 日本');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true);
        });

        test('OR検索の右側マッチ', () => {
            const filter = prepare_filter('トヨタ OR 日本');
            expect(filter.include.test('日本館')).toBe(true);
        });

        test('OR検索の非マッチ', () => {
            const filter = prepare_filter('トヨタ OR 日本');
            expect(filter.include.test('サウジアラビア館')).toBe(false);
        });

        test('小文字orでも動作', () => {
            const filter = prepare_filter('トヨタ or 日本');
            expect(filter.include.test('トヨタ・パビリオン')).toBe(true);
            expect(filter.include.test('日本館')).toBe(true);
        });

        test('複雑なOR検索', () => {
            const filter = prepare_filter('トヨタ パビリオン OR 日本 館');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true); // 左側（AND）
            expect(filter.include.test('日本国際館')).toBe(true); // 右側（AND）
            expect(filter.include.test('サウジアラビア館')).toBe(false); // どちらでもない
        });
    });

    describe('マイナス検索', () => {
        test('マイナス検索（除外対象なし）', () => {
            const filter = prepare_filter('パビリオン -トヨタ');
            const includeMatch = filter.include.test('日本館パビリオン');
            let excludeMatch = false;
            if (filter.exclude) {
                excludeMatch = filter.exclude.some(regex => regex.test('日本館パビリオン'));
            }
            const finalMatch = includeMatch && !excludeMatch;
            expect(finalMatch).toBe(true);
        });

        test('マイナス検索（除外対象あり）', () => {
            const filter = prepare_filter('パビリオン -トヨタ');
            const includeMatch = filter.include.test('トヨタ・パビリオン');
            let excludeMatch = false;
            if (filter.exclude) {
                excludeMatch = filter.exclude.some(regex => regex.test('トヨタ・パビリオン'));
            }
            const finalMatch = includeMatch && !excludeMatch;
            expect(finalMatch).toBe(false);
        });

        test('複数のマイナス検索', () => {
            const filter = prepare_filter('館 -トヨタ -日本');
            const testText = 'サウジアラビア館';
            const includeMatch = filter.include.test(testText);
            let excludeMatch = false;
            if (filter.exclude) {
                excludeMatch = filter.exclude.some(regex => regex.test(testText));
            }
            const finalMatch = includeMatch && !excludeMatch;
            expect(finalMatch).toBe(true);
        });
    });

    describe('フレーズ検索', () => {
        test('フレーズ検索マッチ', () => {
            const filter = prepare_filter('"トヨタ モビリティ"');
            expect(filter.include.test('トヨタ モビリティ パビリオン')).toBe(true);
        });

        test('フレーズ検索非マッチ（順序不一致）', () => {
            const filter = prepare_filter('"トヨタ モビリティ"');
            expect(filter.include.test('モビリティ・トヨタ・パビリオン')).toBe(false);
        });

        test('フレーズ検索非マッチ（単語間が離れている）', () => {
            const filter = prepare_filter('"トヨタ モビリティ"');
            expect(filter.include.test('トヨタ・パビリオン・モビリティ')).toBe(false);
        });

        test('複数のフレーズ検索', () => {
            const filter = prepare_filter('"トヨタ モビリティ" "日本 館"');
            expect(filter.include.test('トヨタ モビリティ パビリオンと日本 館')).toBe(true);
            expect(filter.include.test('トヨタ モビリティ パビリオン')).toBe(false); // 2つ目のフレーズがない
        });
    });

    describe('ワイルドカード検索', () => {
        test('ワイルドカードマッチ', () => {
            const filter = prepare_filter('トヨタ*パビリオン');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true);
            expect(filter.include.test('トヨタパビリオン')).toBe(true);
        });

        test('前方ワイルドカード', () => {
            const filter = prepare_filter('*館');
            expect(filter.include.test('日本館')).toBe(true);
            expect(filter.include.test('サウジアラビア館')).toBe(true);
            expect(filter.include.test('パビリオン')).toBe(false);
        });

        test('後方ワイルドカード', () => {
            const filter = prepare_filter('日本*');
            expect(filter.include.test('日本館')).toBe(true);
            expect(filter.include.test('日本国際館')).toBe(true);
            expect(filter.include.test('サウジアラビア館')).toBe(false);
        });
    });

    describe('複合検索', () => {
        test('AND + マイナス検索', () => {
            const filter = prepare_filter('パビリオン モビリティ -トヨタ');
            const testText1 = '日産モビリティパビリオン';
            const testText2 = 'トヨタモビリティパビリオン';

            // テスト1: 条件を満たす（パビリオン+モビリティあり、トヨタなし）
            const include1 = filter.include.test(testText1);
            let exclude1 = false;
            if (filter.exclude) {
                exclude1 = filter.exclude.some(regex => regex.test(testText1));
            }
            expect(include1 && !exclude1).toBe(true);

            // テスト2: 条件を満たさない（パビリオン+モビリティあり、トヨタもあり）
            const include2 = filter.include.test(testText2);
            let exclude2 = false;
            if (filter.exclude) {
                exclude2 = filter.exclude.some(regex => regex.test(testText2));
            }
            expect(include2 && !exclude2).toBe(false);
        });

        test('フレーズ + ワイルドカード', () => {
            const filter = prepare_filter('"トヨタ*パビリオン"');
            expect(filter.include.test('トヨタ・モビリティ・パビリオン')).toBe(true);
            expect(filter.include.test('トヨタパビリオン')).toBe(true);
            expect(filter.include.test('パビリオン・トヨタ')).toBe(false); // フレーズなので順序重要
        });

        test('OR + マイナス検索', () => {
            const filter = prepare_filter('トヨタ OR 日本 -モビリティ');
            
            // トヨタあり、モビリティなし → マッチ
            const test1 = 'トヨタ館';
            const include1 = filter.include.test(test1);
            let exclude1 = false;
            if (filter.exclude) {
                exclude1 = filter.exclude.some(regex => regex.test(test1));
            }
            expect(include1 && !exclude1).toBe(true);

            // トヨタあり、モビリティもあり → 除外
            const test2 = 'トヨタモビリティパビリオン';
            const include2 = filter.include.test(test2);
            let exclude2 = false;
            if (filter.exclude) {
                exclude2 = filter.exclude.some(regex => regex.test(test2));
            }
            expect(include2 && !exclude2).toBe(false);
        });
    });

    describe('エッジケース', () => {
        test('スペースのみの検索文字列', () => {
            const filter = prepare_filter('   ');
            expect(filter.include.test('')).toBe(true);
            expect(filter.include.test('任意のテキスト')).toBe(true);
        });

        test('特殊文字を含む検索', () => {
            const filter = prepare_filter('パビリオン（東京）');
            expect(filter.include.test('パビリオン（東京）館')).toBe(true);
        });

        test('数字を含む検索', () => {
            const filter = prepare_filter('2025 万博');
            expect(filter.include.test('大阪2025万博パビリオン')).toBe(true);
            expect(filter.include.test('万博2025館')).toBe(true);
        });

        test('マイナス記号のみ', () => {
            const filter = prepare_filter('-');
            // マイナス記号のみの場合は通常検索として扱われる
            expect(filter.include.test('-')).toBe(true);
            expect(filter.exclude).toBe(null);
        });
    });
});