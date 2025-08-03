# Unit Test 不足領域分析

## 現在のテスト状況再分類

### 既存103テストの実態
| テストファイル | テスト数 | 実態分類 | 理由 |
|---|---|---|---|
| `pavilion-search.test.js` | 28 | **真のUnit Test** | `prepare_filter`関数のみを単体テスト |
| `cache-system.test.js` | 15 | **真のUnit Test** | `cacheManager`の各メソッドを個別テスト |
| `calendar-monitoring.test.js` | 16 | **Component Test** | DOM操作含む複数関数組み合わせ |
| `fab-ui.test.js` | 19 | **Component Test** | UI作成・表示系の統合的テスト |
| `time-slot-monitoring.test.js` | 44 | **Integration Test** | 複数の状態管理・DOM操作の組み合わせ |
| `integration-normal-flow.test.js` | 9 | **Integration Test** | エンドツーエンドシナリオ |

### Unit Test実装状況
- **実装済み**: 2関数（`prepare_filter`, `cacheManager`メソッド群）
- **未実装**: 約80関数
- **実装率**: 約2.5%

## 全関数分析（優先度付き）

### 【優先度A: 高】純粋関数・重要ロジック（Unit Test必須）

#### 1-1. 文字列・データ処理系
```javascript
prepare_filter(val_search)              // ✅ 実装済み (28テスト)
extractTimeSlotInfo(buttonElement)      // ❌ 未実装
generateUniqueTdSelector(tdElement)     // ❌ 未実装  
getTdPositionInfo(tdElement)            // ❌ 未実装
extractTdStatus(tdElement)              // ❌ 未実装
getMonitorButtonText(slotInfo)          // ❌ 未実装
getCurrentMode()                        // ❌ 未実装
```

#### 1-2. 判定・検証系
```javascript
checkTimeSlotTableExistsSync()          // ❌ 未実装
validatePageLoaded()                    // ❌ 未実装
checkMaxReloads(currentCount)           // ❌ 未実装
isInterruptionAllowed()                 // ❌ 未実装
canStartReservation()                   // ❌ 未実装
checkVisitTimeButtonState()             // ❌ 未実装
checkTimeSlotSelected()                 // ❌ 未実装
```

#### 1-3. 設定・計算系
```javascript
getRandomWaitTime(minTime, randomRange, config)  // ❌ 未実装
getCurrentEntranceConfig()              // ❌ 未実装
getTargetDisplayInfo()                  // ❌ 未実装
identify_page_type(url)                 // ❌ 未実装
```

### 【優先度B: 中】副作用少・テスト可能

#### 2-1. DOM検索・操作系（モック使用でUnit Test可能）
```javascript
findSameTdElement(targetInfo)           // ❌ 未実装
findTargetSlotInPage()                  // ❌ 未実装
checkTargetElementExists(targetInfo)    // ❌ 未実装
getCurrentSelectedCalendarDate()        // ❌ 未実装（部分的に既存テストあり）
```

#### 2-2. 状態管理系
```javascript
setPageLoadingState(isLoading)          // ❌ 未実装
getCurrentReservationTarget()           // ❌ 未実装
shouldUpdateMonitorButtons()            // ❌ 未実装
```

### 【優先度C: 低】副作用多・Integration Testが適している

#### 3-1. 非同期・DOM操作系
```javascript
waitForElement(selector, timeout, config)       // Integration Testで十分
waitForAnyElement(selectors, timeout, ...)      // Integration Testで十分  
clickElement(element, config)                   // Integration Testで十分
startTimeSlotTableObserver()                    // Integration Testで十分
createEntranceReservationUI(config)            // Integration Testで十分
```

#### 3-2. 複雑な状態遷移系
```javascript
startSlotMonitoring()                   // Integration Testで十分
stopSlotMonitoring()                    // Integration Testで十分
handleMonitorButtonClick(...)           // Integration Testで十分
entranceReservationHelper(config)       // Integration Testで十分
```

## Unit Test実装推奨順序

### Phase 1: 純粋関数（モックなしでテスト可能）
1. `extractTimeSlotInfo(buttonElement)` - DOM要素解析ロジック
2. `getMonitorButtonText(slotInfo)` - 表示テキスト生成
3. `getCurrentMode()` - 状態判定ロジック
4. `getRandomWaitTime(minTime, randomRange, config)` - 計算ロジック
5. `identify_page_type(url)` - URL判定ロジック

### Phase 2: DOM検索系（DOMモック使用）
6. `generateUniqueTdSelector(tdElement)` - セレクタ生成
7. `getTdPositionInfo(tdElement)` - 位置情報抽出
8. `extractTdStatus(tdElement)` - 状態抽出
9. `findSameTdElement(targetInfo)` - 要素検索

### Phase 3: 判定・検証系（条件分岐テスト）
10. `checkTimeSlotTableExistsSync()` - 存在チェック
11. `validatePageLoaded()` - ページ状態検証
12. `canStartReservation()` - 予約可能判定
13. `isInterruptionAllowed()` - 中断可能判定

## 期待される効果

### Unit Test実装による利点
1. **分割作業の安全性向上**: 各関数の動作が保証される
2. **リファクタリング容易性**: 個別関数の変更影響を迅速検出
3. **バグ発見率向上**: 複雑な条件分岐・エッジケースの検証
4. **開発効率向上**: デバッグ時間の短縮

### 実装工数見積もり
- **Phase 1**: 5関数 × 3-5テスト = 約15-25テスト (2-3時間)
- **Phase 2**: 4関数 × 4-6テスト = 約16-24テスト (3-4時間)  
- **Phase 3**: 4関数 × 3-4テスト = 約12-16テスト (2-3時間)
- **合計**: 約43-65テスト (7-10時間)

## 次のアクション

**Phase 1の純粋関数Unit Test**から開始し、段階的に実装します。これにより分割作業前に堅牢なテスト基盤が確立されます。