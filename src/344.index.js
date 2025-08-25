"use strict";
(this["webpackChunkYtomoExtension"] = this["webpackChunkYtomoExtension"] || []).push([[344],{

/***/ 61:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `
.ticket-tab[data-v-c8ad2006] {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}
.add-ticket-section[data-v-c8ad2006] {
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}
.loading-section[data-v-c8ad2006] {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}
.loading-spinner[data-v-c8ad2006] {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #0066cc;
  border-radius: 50%;
  animation: spin-c8ad2006 1s linear infinite;
}
@keyframes spin-c8ad2006 {
0% { transform: rotate(0deg);
}
100% { transform: rotate(360deg);
}
}
.ticket-controls[data-v-c8ad2006] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.ticket-count[data-v-c8ad2006] {
  font-weight: 500;
  color: #333;
}
.control-buttons[data-v-c8ad2006] {
  display: flex;
  gap: 8px;
}
.entrance-dates-section[data-v-c8ad2006] {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 6px;
  border: 1px solid #cce7ff;
}
.section-label[data-v-c8ad2006] {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
.ticket-list[data-v-c8ad2006] {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.ytomo-ticket-item[data-v-c8ad2006] {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}
.ytomo-ticket-item[data-v-c8ad2006]:last-child {
  border-bottom: none;
}
.ytomo-ticket-item[data-v-c8ad2006]:hover {
  background-color: #f8f9fa;
}
.ytomo-ticket-item.selected[data-v-c8ad2006] {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}
.ytomo-add-ticket-item[data-v-c8ad2006] {
  background-color: #f8f9fa;
  border: 2px dashed #ccc;
}
.ytomo-ticket-upper[data-v-c8ad2006] {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ticket-checkbox[data-v-c8ad2006] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
.ticket-info[data-v-c8ad2006] {
  display: flex;
  flex-direction: column;
  flex: 1;
  cursor: pointer;
}
.ticket-id[data-v-c8ad2006] {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}
.ticket-details[data-v-c8ad2006] {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.ticket-label[data-v-c8ad2006] {
  color: #666;
}
.ticket-type[data-v-c8ad2006] {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}
.ticket-type.own[data-v-c8ad2006] {
  background-color: #e8f5e8;
  color: #2e7d32;
}
.ticket-type.external[data-v-c8ad2006] {
  background-color: #fff3e0;
  color: #f57c00;
}
.ticket-schedules[data-v-c8ad2006] {
  margin-top: 8px;
  margin-left: 26px;
  border-left: 2px solid #e0e0e0;
  padding-left: 12px;
}
.schedule-item[data-v-c8ad2006] {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: #666;
}
.schedule-item.effective[data-v-c8ad2006] {
  color: #2e7d32;
}
.schedule-date[data-v-c8ad2006] {
  font-weight: 500;
  min-width: 80px;
}
.schedule-time[data-v-c8ad2006] {
  min-width: 100px;
  color: #999;
}
.schedule-name[data-v-c8ad2006] {
  flex: 1;
}
.effective-badge[data-v-c8ad2006] {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
}
.no-tickets-message[data-v-c8ad2006] {
  text-align: center;
  padding: 40px;
  color: #666;
}
.no-tickets-message p[data-v-c8ad2006] {
  margin-bottom: 16px;
}

/* 既存スタイルクラス */
.ytomo-input-inline[data-v-c8ad2006] {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}
.ytomo-input-ticket-id[data-v-c8ad2006] {
  min-width: 140px;
}
.ytomo-input-label[data-v-c8ad2006] {
  min-width: 100px;
}
.ytomo-select-inline[data-v-c8ad2006] {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 80px;
  background: white;
}
.ytomo-button[data-v-c8ad2006] {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.ytomo-button.primary[data-v-c8ad2006] {
  background-color: #0066cc;
  color: white;
}
.ytomo-button.primary[data-v-c8ad2006]:hover:not(:disabled) {
  background-color: #0052a3;
}
.ytomo-button.secondary[data-v-c8ad2006] {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
}
.ytomo-button.secondary[data-v-c8ad2006]:hover:not(:disabled) {
  background-color: #eeeeee;
}
.ytomo-button.small[data-v-c8ad2006] {
  padding: 4px 12px;
  font-size: 12px;
}
.ytomo-button[data-v-c8ad2006]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 344:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  VueMainDialogAdapter: () => (/* binding */ VueMainDialogAdapter),
  destroyVueIntegration: () => (/* binding */ destroyVueIntegration),
  getVueIntegration: () => (/* binding */ getVueIntegration),
  initializeVueIntegration: () => (/* binding */ initializeVueIntegration)
});

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm-bundler.js + 6 modules
var vue_esm_bundler = __webpack_require__(425);
// EXTERNAL MODULE: ./node_modules/pinia/dist/pinia.mjs + 6 modules
var dist_pinia = __webpack_require__(644);
;// ./ts/stores/mainDialog.ts
/**
 * メインダイアログ状態管理ストア
 */


const useMainDialogStore = (0,dist_pinia/* defineStore */.nY)('mainDialog', () => {
    // State
    const isVisible = (0,vue_esm_bundler/* ref */.KR)(false);
    const activeTab = (0,vue_esm_bundler/* ref */.KR)('ticket');
    const version = (0,vue_esm_bundler/* ref */.KR)('0.5.4'); // version.datから動的に読み込む予定
    // Actions
    const showDialog = () => {
        isVisible.value = true;
    };
    const hideDialog = () => {
        isVisible.value = false;
    };
    const setActiveTab = (tab) => {
        activeTab.value = tab;
    };
    return {
        // State
        isVisible,
        activeTab,
        version,
        // Actions
        showDialog,
        hideDialog,
        setActiveTab
    };
});

;// ./ts/stores/tickets.ts
/**
 * チケット状態管理ストア
 */


const useTicketsStore = (0,dist_pinia/* defineStore */.nY)('tickets', () => {
    // State
    const tickets = (0,vue_esm_bundler/* ref */.KR)([]);
    const selectedTicketIds = (0,vue_esm_bundler/* ref */.KR)(new Set());
    const isLoading = (0,vue_esm_bundler/* ref */.KR)(false);
    const availableDates = (0,vue_esm_bundler/* ref */.KR)([]);
    // Getters (computed)
    const selectedTickets = (0,vue_esm_bundler/* computed */.EW)(() => tickets.value.filter(ticket => selectedTicketIds.value.has(ticket.ticket_id)));
    const selectedTicketCount = (0,vue_esm_bundler/* computed */.EW)(() => selectedTicketIds.value.size);
    const ownTickets = (0,vue_esm_bundler/* computed */.EW)(() => tickets.value.filter(ticket => ticket.isOwn));
    const externalTickets = (0,vue_esm_bundler/* computed */.EW)(() => tickets.value.filter(ticket => !ticket.isOwn));
    // Actions
    const setTickets = (newTickets) => {
        tickets.value = newTickets;
    };
    const addTicket = (ticket) => {
        const existingIndex = tickets.value.findIndex(t => t.ticket_id === ticket.ticket_id);
        if (existingIndex >= 0) {
            tickets.value[existingIndex] = ticket;
        }
        else {
            tickets.value.push(ticket);
        }
    };
    const selectTicket = (ticketId, selected) => {
        if (selected) {
            selectedTicketIds.value.add(ticketId);
        }
        else {
            selectedTicketIds.value.delete(ticketId);
        }
    };
    const selectAllTickets = () => {
        tickets.value.forEach(ticket => {
            selectedTicketIds.value.add(ticket.ticket_id);
        });
    };
    const deselectAllTickets = () => {
        selectedTicketIds.value.clear();
    };
    const setAvailableDates = (dates) => {
        availableDates.value = dates;
    };
    const setLoading = (loading) => {
        isLoading.value = loading;
    };
    return {
        // State
        tickets,
        selectedTicketIds,
        isLoading,
        availableDates,
        // Getters
        selectedTickets,
        selectedTicketCount,
        ownTickets,
        externalTickets,
        // Actions
        setTickets,
        addTicket,
        selectTicket,
        selectAllTickets,
        deselectAllTickets,
        setAvailableDates,
        setLoading
    };
});

;// ./ts/stores/pavilions.ts
/**
 * パビリオン状態管理ストア
 */


const usePavilionsStore = (0,dist_pinia/* defineStore */.nY)('pavilions', () => {
    // State
    const searchResults = (0,vue_esm_bundler/* ref */.KR)([]);
    const selectedTimeSlots = (0,vue_esm_bundler/* ref */.KR)([]);
    const isAvailableOnlyFilter = (0,vue_esm_bundler/* ref */.KR)(false);
    const isLoading = (0,vue_esm_bundler/* ref */.KR)(false);
    const searchQuery = (0,vue_esm_bundler/* ref */.KR)('');
    const lastSearchResults = (0,vue_esm_bundler/* ref */.KR)([]);
    // Getters (computed)
    const filteredPavilions = (0,vue_esm_bundler/* computed */.EW)(() => {
        if (!isAvailableOnlyFilter.value) {
            return searchResults.value;
        }
        return searchResults.value.filter(pavilion => pavilion.dateStatus !== 2 && // 満員ではない
            pavilion.timeSlots.some(slot => slot.available) // 利用可能な時間帯がある
        );
    });
    const selectedTimeSlotsCount = (0,vue_esm_bundler/* computed */.EW)(() => selectedTimeSlots.value.length);
    const availablePavilionsCount = (0,vue_esm_bundler/* computed */.EW)(() => searchResults.value.filter(pavilion => pavilion.dateStatus !== 2).length);
    // Actions
    const setSearchResults = (results) => {
        searchResults.value = results;
        lastSearchResults.value = [...results]; // キャッシュとして保存
    };
    const addSelectedTimeSlot = (selection) => {
        // 既存の選択を削除（同じパビリオン・時間帯の場合）
        const existingIndex = selectedTimeSlots.value.findIndex(s => s.pavilionId === selection.pavilionId && s.timeSlot.time === selection.timeSlot.time);
        if (existingIndex >= 0) {
            selectedTimeSlots.value.splice(existingIndex, 1);
        }
        else {
            selectedTimeSlots.value.push(selection);
        }
    };
    const removeSelectedTimeSlot = (pavilionId, time) => {
        const index = selectedTimeSlots.value.findIndex(s => s.pavilionId === pavilionId && s.timeSlot.time === time);
        if (index >= 0) {
            selectedTimeSlots.value.splice(index, 1);
        }
    };
    const clearSelectedTimeSlots = () => {
        selectedTimeSlots.value = [];
    };
    const toggleAvailableOnlyFilter = () => {
        isAvailableOnlyFilter.value = !isAvailableOnlyFilter.value;
    };
    const setSearchQuery = (query) => {
        searchQuery.value = query;
    };
    const setLoading = (loading) => {
        isLoading.value = loading;
    };
    // パビリオン選択（一括時間帯選択用）
    const selectAllTimeSlotsForPavilion = (pavilionId) => {
        const pavilion = searchResults.value.find(p => p.id === pavilionId);
        if (pavilion) {
            pavilion.timeSlots
                .filter(slot => slot.available)
                .forEach(slot => {
                addSelectedTimeSlot({ pavilionId, timeSlot: slot });
            });
        }
    };
    const deselectAllTimeSlotsForPavilion = (pavilionId) => {
        const filteredSlots = selectedTimeSlots.value.filter(s => s.pavilionId !== pavilionId);
        selectedTimeSlots.value = filteredSlots;
    };
    return {
        // State
        searchResults,
        selectedTimeSlots,
        isAvailableOnlyFilter,
        isLoading,
        searchQuery,
        lastSearchResults,
        // Getters
        filteredPavilions,
        selectedTimeSlotsCount,
        availablePavilionsCount,
        // Actions
        setSearchResults,
        addSelectedTimeSlot,
        removeSelectedTimeSlot,
        clearSelectedTimeSlots,
        toggleAvailableOnlyFilter,
        setSearchQuery,
        setLoading,
        selectAllTimeSlotsForPavilion,
        deselectAllTimeSlotsForPavilion
    };
});

;// ./ts/composables/useTickets.ts
/**
 * チケット管理Composable
 * 現行のMainDialogFabImpl.handleAddTicket()等の機能を移植
 */


const useTickets = () => {
    const ticketsStore = useTicketsStore();
    const ticketManager = (0,vue_esm_bundler/* inject */.WQ)('ticketManager');
    if (!ticketManager) {
        throw new Error('TicketManager not provided');
    }
    // Computed properties
    const tickets = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.tickets);
    const selectedTickets = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.selectedTickets);
    const selectedTicketCount = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.selectedTicketCount);
    const isLoading = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.isLoading);
    const availableDates = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.availableDates);
    // Actions
    const loadAllTickets = async () => {
        ticketsStore.setLoading(true);
        try {
            const loadedTickets = await ticketManager.loadAllTickets();
            ticketsStore.setTickets(loadedTickets);
            // 利用可能日付を抽出（現行システムと同じロジック）
            const dates = await extractAvailableDates(loadedTickets);
            ticketsStore.setAvailableDates(dates);
            console.log(`✅ チケット読み込み完了: ${loadedTickets.length}件`);
        }
        catch (error) {
            console.error('❌ チケット読み込みエラー:', error);
            throw error;
        }
        finally {
            ticketsStore.setLoading(false);
        }
    };
    const addTicket = async (ticketId, label = '', channel = 4) => {
        try {
            const isExternal = channel === 5;
            await ticketManager.addTicket(ticketId, label, isExternal);
            // チケット一覧を再読み込み
            await loadAllTickets();
            console.log(`✅ チケット追加成功: ${ticketId} (channel: ${channel})`);
        }
        catch (error) {
            console.error('❌ チケット追加エラー:', error);
            throw error;
        }
    };
    const selectTicket = (ticketId, selected) => {
        ticketsStore.selectTicket(ticketId, selected);
        // 現行システムと同様にTicketManagerにも通知
        ticketManager.selectTicket(ticketId, selected);
    };
    const selectAllTickets = () => {
        ticketsStore.selectAllTickets();
        // TicketManagerにも全選択を通知
        tickets.value.forEach(ticket => {
            ticketManager.selectTicket(ticket.ticket_id, true);
        });
    };
    const deselectAllTickets = () => {
        ticketsStore.deselectAllTickets();
        // TicketManagerにも全解除を通知
        tickets.value.forEach(ticket => {
            ticketManager.selectTicket(ticket.ticket_id, false);
        });
    };
    // 現行システムの extractAvailableDates() を移植
    const extractAvailableDates = async (ticketList) => {
        const dates = new Set();
        for (const ticket of ticketList) {
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                // 有効フラグが付いたスケジュールのみを処理
                const effectiveSchedules = ticket.schedules.filter(schedule => schedule.isEffective);
                for (const schedule of effectiveSchedules) {
                    if (schedule.entrance_date) {
                        dates.add(schedule.entrance_date);
                    }
                }
            }
        }
        const sortedDates = Array.from(dates).sort((a, b) => {
            // YYYYMMDD形式は文字列比較で十分（現行システムと同じ）
            if (/^\d{8}$/.test(a) && /^\d{8}$/.test(b)) {
                return a.localeCompare(b);
            }
            else {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateA.getTime() - dateB.getTime();
            }
        });
        return sortedDates;
    };
    // キャッシュからの入場予約選択復元（現行システムから移植）
    const restoreEntranceSelectionFromCache = () => {
        try {
            const cachedDate = localStorage.getItem('ytomo_entrance_selection');
            return cachedDate;
        }
        catch (error) {
            console.warn('入場選択キャッシュ復元エラー:', error);
            return null;
        }
    };
    const saveEntranceSelectionToCache = (date) => {
        try {
            localStorage.setItem('ytomo_entrance_selection', date);
        }
        catch (error) {
            console.warn('入場選択キャッシュ保存エラー:', error);
        }
    };
    const loadFavoriteTickets = async () => {
        console.log('⭐ お気に入りチケット読み込み開始');
        ticketsStore.setLoading(true);
        try {
            // PavilionManagerのお気に入り読み込み機能を活用
            const pavilionManager = (0,vue_esm_bundler/* inject */.WQ)('pavilionManager');
            if (pavilionManager && typeof pavilionManager.loadFavoritePavilions === 'function') {
                // お気に入りパビリオンを読み込み、関連チケットを特定
                const favoritePavilions = await pavilionManager.loadFavoritePavilions();
                console.log(`⭐ お気に入りパビリオン ${favoritePavilions.length}件 読み込み完了`);
            }
            // 通常のチケット読み込みを実行（お気に入り情報も含む）
            await loadAllTickets();
        }
        catch (error) {
            console.error('❌ お気に入りチケット読み込みエラー:', error);
            ticketsStore.setLoading(false);
            throw error;
        }
    };
    return {
        // State
        tickets,
        selectedTickets,
        selectedTicketCount,
        isLoading,
        availableDates,
        // Actions
        loadAllTickets,
        addTicket,
        selectTicket,
        selectAllTickets,
        deselectAllTickets,
        restoreEntranceSelectionFromCache,
        saveEntranceSelectionToCache,
        loadFavoriteTickets
    };
};

;// ./node_modules/ts-loader/index.js??clonedRuleSet-1.use!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/TicketTab.vue?vue&type=script&setup=true&lang=ts


const _hoisted_1 = { class: "ticket-tab" };
const _hoisted_2 = { class: "add-ticket-section" };
const _hoisted_3 = { class: "ytomo-ticket-item ytomo-add-ticket-item" };
const _hoisted_4 = { class: "ytomo-ticket-upper" };
const _hoisted_5 = ["disabled"];
const _hoisted_6 = ["disabled"];
const _hoisted_7 = {
    key: 0,
    class: "loading-section"
};
const _hoisted_8 = { class: "ticket-list-section" };
const _hoisted_9 = { class: "ticket-controls" };
const _hoisted_10 = { class: "ticket-count" };
const _hoisted_11 = { class: "control-buttons" };
const _hoisted_12 = ["disabled"];
const _hoisted_13 = ["disabled"];
const _hoisted_14 = {
    key: 0,
    class: "entrance-dates-section"
};
const _hoisted_15 = ["value"];
const _hoisted_16 = {
    key: 1,
    class: "ticket-list"
};
const _hoisted_17 = { class: "ytomo-ticket-upper" };
const _hoisted_18 = ["id", "checked", "onChange"];
const _hoisted_19 = ["for"];
const _hoisted_20 = { class: "ticket-id" };
const _hoisted_21 = { class: "ticket-details" };
const _hoisted_22 = { class: "ticket-label" };
const _hoisted_23 = {
    key: 0,
    class: "ticket-schedules"
};
const _hoisted_24 = { class: "schedule-date" };
const _hoisted_25 = {
    key: 0,
    class: "schedule-time"
};
const _hoisted_26 = { class: "schedule-name" };
const _hoisted_27 = {
    key: 1,
    class: "effective-badge"
};


/* harmony default export */ const TicketTabvue_type_script_setup_true_lang_ts = (/*@__PURE__*/(0,vue_esm_bundler/* defineComponent */.pM)({
    __name: 'TicketTab',
    setup(__props) {
        const { tickets, selectedTickets, selectedTicketCount, isLoading, availableDates, loadAllTickets, addTicket, selectTicket, selectAllTickets, deselectAllTickets, restoreEntranceSelectionFromCache, saveEntranceSelectionToCache, loadFavoriteTickets } = useTickets();
        // ローカル状態
        const newTicket = (0,vue_esm_bundler/* ref */.KR)({
            id: '',
            label: '',
            channel: '5' // デフォルトは当日(1)
        });
        const selectedEntranceDate = (0,vue_esm_bundler/* ref */.KR)('');
        // チケットストアから選択されたチケットIDを取得するための computed
        const selectedTicketIds = (0,vue_esm_bundler/* computed */.EW)(() => {
            return new Set(selectedTickets.value.map(ticket => ticket.ticket_id));
        });
        // チケット追加処理
        const handleAddTicket = async () => {
            if (!newTicket.value.id.trim()) {
                alert('チケットIDを入力してください');
                return;
            }
            try {
                const label = newTicket.value.label.trim() || '外部チケット';
                const channel = parseInt(newTicket.value.channel);
                await addTicket(newTicket.value.id.trim(), label, channel);
                // 入力フィールドをクリア
                newTicket.value.id = '';
                newTicket.value.label = '';
                newTicket.value.channel = '5';
                console.log('✅ チケット追加完了');
            }
            catch (error) {
                console.error('❌ チケット追加エラー:', error);
                alert('チケットの追加に失敗しました: ' + String(error));
            }
        };
        // チケット選択処理
        const handleTicketSelect = (ticketId, selected) => {
            selectTicket(ticketId, selected);
        };
        // 全選択
        const handleSelectAll = () => {
            selectAllTickets();
        };
        // 全解除
        const handleDeselectAll = () => {
            deselectAllTickets();
        };
        // 再読み込み
        const handleReload = async () => {
            try {
                await loadAllTickets();
                console.log('✅ チケット再読み込み完了');
            }
            catch (error) {
                console.error('❌ チケット再読み込みエラー:', error);
                alert('チケットの再読み込みに失敗しました: ' + String(error));
            }
        };
        // お気に入り読み込み処理
        const handleLoadFavorites = async () => {
            try {
                await loadFavoriteTickets();
                console.log('✅ お気に入りチケット読み込み完了');
            }
            catch (error) {
                console.error('❌ お気に入りチケット読み込みエラー:', error);
                alert('お気に入りチケットの読み込みに失敗しました: ' + String(error));
            }
        };
        // 入場日選択処理
        const handleEntranceDateChange = () => {
            if (selectedEntranceDate.value) {
                saveEntranceSelectionToCache(selectedEntranceDate.value);
                console.log('🗓️ 入場日選択:', selectedEntranceDate.value);
            }
        };
        // 日付フォーマット関数
        const formatDate = (dateString) => {
            // YYYYMMDD形式の場合
            if (/^\d{8}$/.test(dateString)) {
                const year = dateString.substring(0, 4);
                const month = dateString.substring(4, 6);
                const day = dateString.substring(6, 8);
                return `${year}/${month}/${day}`;
            }
            // その他の形式はそのまま表示
            return dateString;
        };
        // コンポーネントマウント時の初期化
        (0,vue_esm_bundler/* onMounted */.sV)(async () => {
            try {
                await loadAllTickets();
                // 入場日選択の復元
                const cachedDate = restoreEntranceSelectionFromCache();
                if (cachedDate) {
                    selectedEntranceDate.value = cachedDate;
                }
                console.log('✅ TicketTab初期化完了');
            }
            catch (error) {
                console.error('❌ TicketTab初期化エラー:', error);
            }
        });
        // 利用可能日付が変更された時の処理
        (0,vue_esm_bundler/* watch */.wB)(availableDates, (newDates) => {
            // 選択されている日付が新しい利用可能日付に含まれているかチェック
            if (selectedEntranceDate.value && !newDates.includes(selectedEntranceDate.value)) {
                selectedEntranceDate.value = '';
            }
        });
        return (_ctx, _cache) => {
            return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_1, [
                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケット追加セクション "),
                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_2, [
                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_3, [
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_4, [
                            (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => ((newTicket.value.id) = $event)),
                                type: "text",
                                placeholder: "チケットID",
                                class: "ytomo-input-inline ytomo-input-ticket-id",
                                onKeydown: (0,vue_esm_bundler/* withKeys */.jR)(handleAddTicket, ["enter"])
                            }, null, 544 /* NEED_HYDRATION, NEED_PATCH */), [
                                [vue_esm_bundler/* vModelText */.Jo, newTicket.value.id]
                            ]),
                            (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => ((newTicket.value.label) = $event)),
                                type: "text",
                                placeholder: "Label",
                                class: "ytomo-input-inline ytomo-input-label",
                                onKeydown: (0,vue_esm_bundler/* withKeys */.jR)(handleAddTicket, ["enter"])
                            }, null, 544 /* NEED_HYDRATION, NEED_PATCH */), [
                                [vue_esm_bundler/* vModelText */.Jo, newTicket.value.label]
                            ]),
                            (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("select", {
                                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => ((newTicket.value.channel) = $event)),
                                class: "ytomo-select-inline"
                            }, [...(_cache[4] || (_cache[4] = [
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("option", { value: "5" }, "1", -1 /* CACHED */),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("option", { value: "4" }, "3", -1 /* CACHED */),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("option", { value: "3" }, "週", -1 /* CACHED */),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("option", { value: "2" }, "月", -1 /* CACHED */)
                                ]))], 512 /* NEED_PATCH */), [
                                [vue_esm_bundler/* vModelSelect */.u1, newTicket.value.channel]
                            ]),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                onClick: handleAddTicket,
                                class: "ytomo-button primary",
                                disabled: !newTicket.value.id || (0,vue_esm_bundler/* unref */.R1)(isLoading)
                            }, " Add ", 8 /* PROPS */, _hoisted_5),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                onClick: handleLoadFavorites,
                                class: "ytomo-button secondary",
                                disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading)
                            }, " ⭐お気に入り読み込み ", 8 /* PROPS */, _hoisted_6)
                        ])
                    ])
                ]),
                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" ローディング表示 "),
                ((0,vue_esm_bundler/* unref */.R1)(isLoading))
                    ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_7, [...(_cache[5] || (_cache[5] = [
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", { class: "loading-spinner" }, null, -1 /* CACHED */),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("span", null, "チケット情報を読み込み中...", -1 /* CACHED */)
                        ]))]))
                    : ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, { key: 1 }, [
                        (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケット一覧セクション "),
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_8, [
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケット操作バー "),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_9, [
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_10, " 選択中: " + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(selectedTicketCount)) + " / " + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(tickets).length) + " チケット ", 1 /* TEXT */),
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_11, [
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                        onClick: handleSelectAll,
                                        class: "ytomo-button secondary small",
                                        disabled: (0,vue_esm_bundler/* unref */.R1)(tickets).length === 0
                                    }, " 全選択 ", 8 /* PROPS */, _hoisted_12),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                        onClick: handleDeselectAll,
                                        class: "ytomo-button secondary small",
                                        disabled: (0,vue_esm_bundler/* unref */.R1)(selectedTicketCount) === 0
                                    }, " 全解除 ", 8 /* PROPS */, _hoisted_13),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                        onClick: handleReload,
                                        class: "ytomo-button secondary small"
                                    }, " 再読み込み ")
                                ])
                            ]),
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 利用可能日付セクション（入場予約用） "),
                            ((0,vue_esm_bundler/* unref */.R1)(availableDates).length > 0)
                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_14, [
                                    _cache[7] || (_cache[7] = (0,vue_esm_bundler/* createElementVNode */.Lk)("label", { class: "section-label" }, "入場予約日選択:", -1 /* CACHED */)),
                                    (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("select", {
                                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => ((selectedEntranceDate).value = $event)),
                                        class: "ytomo-select-inline",
                                        onChange: handleEntranceDateChange
                                    }, [
                                        _cache[6] || (_cache[6] = (0,vue_esm_bundler/* createElementVNode */.Lk)("option", { value: "" }, "-- 日付を選択 --", -1 /* CACHED */)),
                                        ((0,vue_esm_bundler/* openBlock */.uX)(true), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, null, (0,vue_esm_bundler/* renderList */.pI)((0,vue_esm_bundler/* unref */.R1)(availableDates), (date) => {
                                            return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("option", {
                                                key: date,
                                                value: date
                                            }, (0,vue_esm_bundler/* toDisplayString */.v_)(formatDate(date)), 9 /* TEXT, PROPS */, _hoisted_15));
                                        }), 128 /* KEYED_FRAGMENT */))
                                    ], 544 /* NEED_HYDRATION, NEED_PATCH */), [
                                        [vue_esm_bundler/* vModelSelect */.u1, selectedEntranceDate.value]
                                    ])
                                ]))
                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true),
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケットリスト "),
                            ((0,vue_esm_bundler/* unref */.R1)(tickets).length > 0)
                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_16, [
                                    ((0,vue_esm_bundler/* openBlock */.uX)(true), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, null, (0,vue_esm_bundler/* renderList */.pI)((0,vue_esm_bundler/* unref */.R1)(tickets), (ticket) => {
                                        return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", {
                                            key: ticket.ticket_id,
                                            class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-ticket-item", {
                                                    'selected': selectedTicketIds.value.has(ticket.ticket_id),
                                                    'own-ticket': ticket.isOwn,
                                                    'external-ticket': !ticket.isOwn
                                                }])
                                        }, [
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_17, [
                                                (0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                                                    type: "checkbox",
                                                    id: 'ticket-' + ticket.ticket_id,
                                                    checked: selectedTicketIds.value.has(ticket.ticket_id),
                                                    onChange: ($event) => (handleTicketSelect(ticket.ticket_id, $event.target.checked)),
                                                    class: "ticket-checkbox"
                                                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_18),
                                                (0,vue_esm_bundler/* createElementVNode */.Lk)("label", {
                                                    for: 'ticket-' + ticket.ticket_id,
                                                    class: "ticket-info"
                                                }, [
                                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_20, (0,vue_esm_bundler/* toDisplayString */.v_)(ticket.ticket_id), 1 /* TEXT */),
                                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_21, [
                                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("span", _hoisted_22, (0,vue_esm_bundler/* toDisplayString */.v_)(ticket.label || '無名チケット'), 1 /* TEXT */),
                                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("span", {
                                                            class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ticket-type", { 'own': ticket.isOwn, 'external': !ticket.isOwn }])
                                                        }, (0,vue_esm_bundler/* toDisplayString */.v_)(ticket.isOwn ? '自分' : '外部'), 3 /* TEXT, CLASS */)
                                                    ])
                                                ], 8 /* PROPS */, _hoisted_19)
                                            ]),
                                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" スケジュール情報 "),
                                            (ticket.schedules && ticket.schedules.length > 0)
                                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_23, [
                                                    ((0,vue_esm_bundler/* openBlock */.uX)(true), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, null, (0,vue_esm_bundler/* renderList */.pI)(ticket.schedules, (schedule) => {
                                                        return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", {
                                                            key: schedule.entrance_date + schedule.time_start,
                                                            class: (0,vue_esm_bundler/* normalizeClass */.C4)(["schedule-item", { 'effective': schedule.isEffective }])
                                                        }, [
                                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("span", _hoisted_24, (0,vue_esm_bundler/* toDisplayString */.v_)(formatDate(schedule.entrance_date)), 1 /* TEXT */),
                                                            (schedule.time_start && schedule.time_end)
                                                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", _hoisted_25, (0,vue_esm_bundler/* toDisplayString */.v_)(schedule.time_start) + " - " + (0,vue_esm_bundler/* toDisplayString */.v_)(schedule.time_end), 1 /* TEXT */))
                                                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true),
                                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("span", _hoisted_26, (0,vue_esm_bundler/* toDisplayString */.v_)(schedule.schedule_name), 1 /* TEXT */),
                                                            (schedule.isEffective)
                                                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", _hoisted_27, "有効"))
                                                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                                        ], 2 /* CLASS */));
                                                    }), 128 /* KEYED_FRAGMENT */))
                                                ]))
                                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                        ], 2 /* CLASS */));
                                    }), 128 /* KEYED_FRAGMENT */))
                                ]))
                                : ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, { key: 2 }, [
                                    (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケットなしメッセージ "),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", { class: "no-tickets-message" }, [
                                        _cache[8] || (_cache[8] = (0,vue_esm_bundler/* createElementVNode */.Lk)("p", null, "チケットが見つかりませんでした。", -1 /* CACHED */)),
                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                            onClick: handleReload,
                                            class: "ytomo-button secondary"
                                        }, " チケットを再読み込み ")
                                    ])
                                ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
                        ])
                    ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
            ]));
        };
    }
}));

;// ./ts/components/TicketTab.vue?vue&type=script&setup=true&lang=ts
 
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(72);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(825);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(659);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(56);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(540);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(113);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/TicketTab.vue?vue&type=style&index=0&id=c8ad2006&scoped=true&lang=css
var TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css = __webpack_require__(61);
;// ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/TicketTab.vue?vue&type=style&index=0&id=c8ad2006&scoped=true&lang=css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css/* default */.A, options);




       /* harmony default export */ const components_TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css = (TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css/* default */.A && TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css/* default */.A.locals ? TicketTabvue_type_style_index_0_id_c8ad2006_scoped_true_lang_css/* default */.A.locals : undefined);

;// ./ts/components/TicketTab.vue?vue&type=style&index=0&id=c8ad2006&scoped=true&lang=css

// EXTERNAL MODULE: ./node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(262);
;// ./ts/components/TicketTab.vue



;


const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.A)(TicketTabvue_type_script_setup_true_lang_ts, [['__scopeId',"data-v-c8ad2006"]])

/* harmony default export */ const TicketTab = (__exports__);
;// ./ts/composables/usePavilions.ts
/**
 * パビリオン管理Composable
 * 現行のPavilionManager機能を移植
 */



const usePavilions = () => {
    const pavilionsStore = usePavilionsStore();
    const ticketsStore = useTicketsStore();
    const pavilionManager = (0,vue_esm_bundler/* inject */.WQ)('pavilionManager');
    if (!pavilionManager) {
        throw new Error('PavilionManager not provided');
    }
    // Computed properties
    const searchResults = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.searchResults);
    const filteredPavilions = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.filteredPavilions);
    const selectedTimeSlots = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.selectedTimeSlots);
    const selectedTimeSlotsCount = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.selectedTimeSlotsCount);
    const availablePavilionsCount = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.availablePavilionsCount);
    const isAvailableOnlyFilter = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.isAvailableOnlyFilter);
    const isLoading = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.isLoading);
    const searchQuery = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.searchQuery);
    // Actions
    const searchPavilions = async (query, entranceDate) => {
        pavilionsStore.setLoading(true);
        pavilionsStore.setSearchQuery(query);
        try {
            // 選択されたチケットIDを取得
            const selectedTicketIds = Array.from(ticketsStore.selectedTicketIds);
            console.log(`🏛️ パビリオン検索: "${query}" (チケット: ${selectedTicketIds.length}個)`);
            console.log(`🔍 検索チケットIDs:`, selectedTicketIds);
            // PavilionManagerを通じて検索実行
            const results = await pavilionManager.searchPavilions(query, selectedTicketIds, entranceDate);
            pavilionsStore.setSearchResults(results);
            console.log(`✅ パビリオン検索完了: ${results.length}件`);
        }
        catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            throw error;
        }
        finally {
            pavilionsStore.setLoading(false);
        }
    };
    const refreshPavilionData = async () => {
        pavilionsStore.setLoading(true);
        try {
            console.log('🔄 パビリオンデータ再取得');
            // 最後の検索条件で再検索
            const results = await pavilionManager.refreshPavilionData();
            pavilionsStore.setSearchResults(results);
            console.log(`✅ パビリオンデータ再取得完了: ${results.length}件`);
        }
        catch (error) {
            console.error('❌ パビリオンデータ再取得エラー:', error);
            throw error;
        }
        finally {
            pavilionsStore.setLoading(false);
        }
    };
    const loadFavoritePavilions = async () => {
        console.log('⭐ お気に入りパビリオン読み込み開始');
        pavilionsStore.setLoading(true);
        try {
            if (typeof pavilionManager.loadFavoritePavilions !== 'function') {
                throw new Error('お気に入り読み込み機能が利用できません');
            }
            const favoritePavilions = await pavilionManager.loadFavoritePavilions();
            if (favoritePavilions.length === 0) {
                console.log('⭐ お気に入り未登録のため処理終了');
                pavilionsStore.setSearchResults([]);
                return;
            }
            pavilionsStore.setSearchResults(favoritePavilions);
            console.log(`⭐ お気に入りパビリオン読み込み完了: ${favoritePavilions.length}件`);
        }
        catch (error) {
            console.error('❌ お気に入りパビリオン読み込みエラー:', error);
            throw error;
        }
        finally {
            pavilionsStore.setLoading(false);
        }
    };
    const selectTimeSlot = (pavilionId, timeSlot) => {
        const selection = {
            pavilionId,
            timeSlot
        };
        // Piniaストアで選択状態を更新
        pavilionsStore.addSelectedTimeSlot(selection);
        // PavilionManagerにも通知
        pavilionManager.selectTimeSlot(pavilionId, timeSlot);
        console.log(`🕐 時間帯選択: ${pavilionId} - ${timeSlot.time}`);
    };
    const removeTimeSlot = (pavilionId, time) => {
        // Piniaストアで選択状態を削除
        pavilionsStore.removeSelectedTimeSlot(pavilionId, time);
        // PavilionManagerにも通知（選択解除）
        const timeSlot = {
            time,
            available: true,
            selected: false,
            reservationType: ''
        };
        pavilionManager.selectTimeSlot(pavilionId, timeSlot);
        console.log(`🕐 時間帯選択解除: ${pavilionId} - ${time}`);
    };
    const clearSelectedTimeSlots = () => {
        // Piniaストアをクリア
        pavilionsStore.clearSelectedTimeSlots();
        // PavilionManagerもクリア
        pavilionManager.clearSelectedTimeSlots();
        console.log('🧹 選択済み時間帯をクリア');
    };
    const selectAllTimeSlotsForPavilion = (pavilionId) => {
        pavilionsStore.selectAllTimeSlotsForPavilion(pavilionId);
        // PavilionManagerにも通知
        const pavilion = searchResults.value.find(p => p.id === pavilionId);
        if (pavilion) {
            pavilion.timeSlots
                .filter(slot => slot.available)
                .forEach(slot => {
                const selectedSlot = { ...slot, selected: true };
                pavilionManager.selectTimeSlot(pavilionId, selectedSlot);
            });
        }
        console.log(`🏛️ パビリオン全選択: ${pavilionId}`);
    };
    const deselectAllTimeSlotsForPavilion = (pavilionId) => {
        pavilionsStore.deselectAllTimeSlotsForPavilion(pavilionId);
        // PavilionManagerにも通知
        const pavilion = searchResults.value.find(p => p.id === pavilionId);
        if (pavilion) {
            pavilion.timeSlots.forEach(slot => {
                const deselectedSlot = { ...slot, selected: false };
                pavilionManager.selectTimeSlot(pavilionId, deselectedSlot);
            });
        }
        console.log(`🏛️ パビリオン全解除: ${pavilionId}`);
    };
    const toggleAvailableOnlyFilter = () => {
        pavilionsStore.toggleAvailableOnlyFilter();
        console.log(`🔍 空き枠フィルター: ${pavilionsStore.isAvailableOnlyFilter ? 'ON' : 'OFF'}`);
    };
    // パビリオン予約実行
    const executeReservation = async (entranceDate, registeredChannel) => {
        try {
            console.log('🎯 パビリオン予約実行開始');
            if (selectedTimeSlots.value.length === 0) {
                throw new Error('予約する時間帯が選択されていません');
            }
            const results = [];
            // 選択された各時間帯に対して予約を実行
            for (const selection of selectedTimeSlots.value) {
                console.log(`🎯 予約実行: ${selection.pavilionId} - ${selection.timeSlot.time}`);
                const result = await pavilionManager.executeReservation(selection.pavilionId, selection.timeSlot, entranceDate, registeredChannel);
                results.push({
                    pavilionId: selection.pavilionId,
                    timeSlot: selection.timeSlot,
                    result
                });
                if (result.success) {
                    console.log(`✅ 予約成功: ${selection.pavilionId} - ${selection.timeSlot.time}`);
                }
                else {
                    console.log(`❌ 予約失敗: ${selection.pavilionId} - ${selection.timeSlot.time} (${result.message})`);
                }
            }
            // 成功した予約がある場合は選択状態をクリア
            const hasSuccess = results.some(r => r.result.success);
            if (hasSuccess) {
                clearSelectedTimeSlots();
            }
            return {
                success: hasSuccess,
                results,
                message: hasSuccess ?
                    `${results.filter(r => r.result.success).length}件の予約が完了しました` :
                    '全ての予約に失敗しました'
            };
        }
        catch (error) {
            console.error('❌ パビリオン予約実行エラー:', error);
            throw error;
        }
    };
    // 検索結果のキャッシュから取得
    const getLastSearchResults = () => {
        return pavilionsStore.lastSearchResults;
    };
    // パビリオン詳細情報を取得
    const getPavilionById = (pavilionId) => {
        return searchResults.value.find(p => p.id === pavilionId);
    };
    // 利用可能な時間帯のみを取得
    const getAvailableTimeSlots = (pavilionId) => {
        const pavilion = getPavilionById(pavilionId);
        return pavilion ? pavilion.timeSlots.filter(slot => slot.available) : [];
    };
    // 選択中の時間帯数を取得（パビリオン別）
    const getSelectedTimeSlotsCountForPavilion = (pavilionId) => {
        return selectedTimeSlots.value.filter(s => s.pavilionId === pavilionId).length;
    };
    // パビリオンが満席かどうか
    const isPavilionFullyBooked = (pavilionId) => {
        const pavilion = getPavilionById(pavilionId);
        return pavilion ? pavilion.dateStatus === 2 : false;
    };
    return {
        // State
        searchResults,
        filteredPavilions,
        selectedTimeSlots,
        selectedTimeSlotsCount,
        availablePavilionsCount,
        isAvailableOnlyFilter,
        isLoading,
        searchQuery,
        // Actions
        searchPavilions,
        refreshPavilionData,
        loadFavoritePavilions,
        selectTimeSlot,
        removeTimeSlot,
        clearSelectedTimeSlots,
        selectAllTimeSlotsForPavilion,
        deselectAllTimeSlotsForPavilion,
        toggleAvailableOnlyFilter,
        executeReservation,
        // Getters
        getLastSearchResults,
        getPavilionById,
        getAvailableTimeSlots,
        getSelectedTimeSlotsCountForPavilion,
        isPavilionFullyBooked
    };
};

;// ./node_modules/ts-loader/index.js??clonedRuleSet-1.use!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/PavilionTab.vue?vue&type=script&setup=true&lang=ts


const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_1 = { class: "pavilion-tab" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_2 = { class: "search-section" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_3 = { class: "div-flex" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_4 = ["disabled"];
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_5 = ["disabled"];
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_6 = {
    key: 0,
    class: "reservation-section"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_7 = ["disabled"];
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_8 = { class: "filter-section" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_9 = { class: "filter-option" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_10 = {
    key: 0,
    class: "loading-section"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_11 = { class: "results-section" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_12 = {
    key: 0,
    class: "results-summary"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_13 = { class: "results-count" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_14 = { key: 0 };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_15 = { class: "selection-info" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_16 = {
    class: "pavilion-list",
    id: "pavilion-list-container"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_17 = {
    key: 0,
    class: "ytomo-empty-state"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_18 = { class: "ytomo-pavilion-header" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_19 = ["onClick"];
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_20 = { class: "ytomo-pavilion-checkbox-container" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_21 = ["checked", "indeterminate", "onChange"];
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_22 = { class: "ytomo-pavilion-name" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_23 = { class: "pavilion-status" };
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_24 = {
    key: 0,
    class: "status-badge full"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_25 = {
    key: 1,
    class: "status-badge unavailable"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_26 = {
    key: 2,
    class: "status-badge available"
};
const PavilionTabvue_type_script_setup_true_lang_ts_hoisted_27 = ["onClick"];
const _hoisted_28 = ["disabled", "onClick"];
const _hoisted_29 = { class: "time-text" };
const _hoisted_30 = {
    key: 0,
    class: "reservation-type"
};
const _hoisted_31 = {
    key: 0,
    class: "no-timeslots"
};
const _hoisted_32 = {
    key: 1,
    class: "reservation-controls"
};
const _hoisted_33 = ["disabled"];
const _hoisted_34 = ["disabled"];




/* harmony default export */ const PavilionTabvue_type_script_setup_true_lang_ts = (/*@__PURE__*/(0,vue_esm_bundler/* defineComponent */.pM)({
    __name: 'PavilionTab',
    setup(__props) {
        const { searchResults, filteredPavilions, selectedTimeSlots, selectedTimeSlotsCount, availablePavilionsCount, isAvailableOnlyFilter, isLoading, searchPavilions, loadFavoritePavilions, selectTimeSlot, removeTimeSlot, clearSelectedTimeSlots, selectAllTimeSlotsForPavilion, deselectAllTimeSlotsForPavilion, toggleAvailableOnlyFilter, executeReservation, getPavilionById, getAvailableTimeSlots, getSelectedTimeSlotsCountForPavilion } = usePavilions();
        const ticketsStore = useTicketsStore();
        const pavilionsStore = usePavilionsStore();
        // ローカル状態
        const searchInput = (0,vue_esm_bundler/* ref */.KR)('');
        const expandedPavilions = (0,vue_esm_bundler/* ref */.KR)(new Set());
        // チケット選択状態を監視
        const selectedTicketCount = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.selectedTicketCount);
        // 検索処理
        const handleSearch = async () => {
            if (selectedTicketCount.value === 0) {
                alert('検索を行うには、まずチケットを選択してください');
                return;
            }
            try {
                await searchPavilions(searchInput.value.trim());
            }
            catch (error) {
                console.error('❌ パビリオン検索エラー:', error);
                alert('検索に失敗しました: ' + String(error));
            }
        };
        // 時間帯表示切り替え
        const toggleTimeSlotDisplay = (pavilionId) => {
            const newSet = new Set(expandedPavilions.value);
            if (newSet.has(pavilionId)) {
                newSet.delete(pavilionId);
            }
            else {
                newSet.add(pavilionId);
            }
            expandedPavilions.value = newSet;
        };
        // お気に入り切り替え
        const toggleFavorite = (pavilionId, pavilionName) => {
            const pavilion = getPavilionById(pavilionId);
            if (pavilion) {
                pavilion.isFavorite = !pavilion.isFavorite;
                console.log(`⭐ お気に入り${pavilion.isFavorite ? '追加' : '削除'}: ${pavilionName}`);
            }
        };
        // 時間帯選択
        const handleTimeSlotSelect = (pavilionId, timeSlot) => {
            if (!timeSlot.available)
                return;
            if (isTimeSlotSelected(pavilionId, timeSlot.time)) {
                // 選択解除
                removeTimeSlot(pavilionId, timeSlot.time);
            }
            else {
                // 選択
                selectTimeSlot(pavilionId, timeSlot);
            }
        };
        // 時間帯が選択されているかチェック  
        const isTimeSlotSelected = (pavilionId, time) => {
            try {
                const slots = pavilionsStore.selectedTimeSlots;
                return Array.isArray(slots) && slots.some(s => s?.pavilionId === pavilionId && s?.timeSlot?.time === time);
            }
            catch {
                return false;
            }
        };
        // パビリオン単位の選択切り替え
        const handlePavilionToggle = (pavilionId, selected) => {
            if (selected) {
                selectAllTimeSlotsForPavilion(pavilionId);
            }
            else {
                deselectAllTimeSlotsForPavilion(pavilionId);
            }
        };
        // パビリオンが部分選択されているかチェック
        const isPartiallySelected = (pavilionId) => {
            const selectedCount = getSelectedTimeSlotsCountForPavilion(pavilionId);
            const availableCount = getAvailableTimeSlots(pavilionId).length;
            return selectedCount > 0 && selectedCount < availableCount;
        };
        // 選択クリア
        const handleClearSelection = () => {
            clearSelectedTimeSlots();
        };
        // 予約実行
        const handleExecuteReservation = async () => {
            if (pavilionsStore.selectedTimeSlotsCount === 0) {
                alert('予約する時間帯を選択してください');
                return;
            }
            const confirmMessage = `${pavilionsStore.selectedTimeSlotsCount}時間帯の予約を実行しますか？`;
            if (!confirm(confirmMessage)) {
                return;
            }
            try {
                // 入場日を取得（実装に応じて調整）
                const entranceDate = '20250501'; // TODO: 実際の入場日を取得
                const registeredChannel = 'default'; // TODO: 実際のチャンネルを取得
                const result = await executeReservation(entranceDate, registeredChannel);
                if (result.success) {
                    alert(`予約が完了しました\n${result.message}`);
                }
                else {
                    alert(`予約に失敗しました\n${result.message}`);
                }
            }
            catch (error) {
                console.error('❌ 予約実行エラー:', error);
                alert('予約実行中にエラーが発生しました: ' + String(error));
            }
        };
        // お気に入り読み込み
        const handleLoadFavorites = async () => {
            try {
                await loadFavoritePavilions();
            }
            catch (error) {
                console.error('❌ お気に入り読み込みエラー:', error);
                alert('お気に入りの読み込みに失敗しました: ' + String(error));
            }
        };
        // 監視モード（実装は今後）
        const handleMonitoringMode = () => {
            alert('監視モード機能は実装中です');
        };
        // 予約種類の表示名取得
        const getReservationTypeDisplay = (type) => {
            switch (type) {
                case 'normal': return '通常';
                case 'lottery': return '抽選';
                case 'priority': return '優先';
                default: return type;
            }
        };
        // コンポーネントマウント時
        (0,vue_esm_bundler/* onMounted */.sV)(() => {
            console.log('✅ PavilionTab mounted');
        });
        return (_ctx, _cache) => {
            return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_1, [
                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 検索セクション "),
                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_2, [
                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_3, [
                        (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => ((searchInput).value = $event)),
                            type: "text",
                            placeholder: "パビリオン名で検索...",
                            class: "ext-tomo search",
                            onKeydown: (0,vue_esm_bundler/* withKeys */.jR)(handleSearch, ["enter"])
                        }, null, 544 /* NEED_HYDRATION, NEED_PATCH */), [
                            [vue_esm_bundler/* vModelText */.Jo, searchInput.value]
                        ]),
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                            onClick: handleSearch,
                            class: "btn-filter-without-load",
                            disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading)
                        }, " 検索 ", 8 /* PROPS */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_4),
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                            onClick: handleLoadFavorites,
                            class: "btn-filter-without-load",
                            disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading)
                        }, " ⭐お気に入り ", 8 /* PROPS */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_5)
                    ]),
                    (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 予約実行ボタン "),
                    ((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount) > 0)
                        ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_6, [
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                onClick: _cache[1] || (_cache[1] =
                                    //@ts-ignore
                                    (...args) => (_ctx.handleReservation && _ctx.handleReservation(...args))),
                                class: "btn-reservation",
                                disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading) || (0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount) === 0
                            }, " 🎯 予約実行 (" + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount)) + "件) ", 9 /* TEXT, PROPS */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_7)
                        ]))
                        : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true),
                    (0,vue_esm_bundler/* createCommentVNode */.Q3)(" フィルターオプション "),
                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_8, [
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("label", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_9, [
                            (0,vue_esm_bundler/* withDirectives */.bo)((0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                                type: "checkbox",
                                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => ((0,vue_esm_bundler/* isRef */.i9)(isAvailableOnlyFilter) ? (isAvailableOnlyFilter).value = $event : null)),
                                onChange: _cache[3] || (_cache[3] =
                                    //@ts-ignore
                                    (...args) => ((0,vue_esm_bundler/* unref */.R1)(toggleAvailableOnlyFilter) && (0,vue_esm_bundler/* unref */.R1)(toggleAvailableOnlyFilter)(...args)))
                            }, null, 544 /* NEED_HYDRATION, NEED_PATCH */), [
                                [vue_esm_bundler/* vModelCheckbox */.lH, (0,vue_esm_bundler/* unref */.R1)(isAvailableOnlyFilter)]
                            ]),
                            _cache[4] || (_cache[4] = (0,vue_esm_bundler/* createTextVNode */.eW)(" 空き枠のみ表示 ", -1 /* CACHED */))
                        ])
                    ])
                ]),
                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" ローディング表示 "),
                ((0,vue_esm_bundler/* unref */.R1)(isLoading))
                    ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_10, [...(_cache[5] || (_cache[5] = [
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", { class: "loading-spinner" }, null, -1 /* CACHED */),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("span", null, "パビリオン情報を検索中...", -1 /* CACHED */)
                        ]))]))
                    : ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, { key: 1 }, [
                        (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 検索結果セクション "),
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_11, [
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 検索結果サマリー "),
                            ((0,vue_esm_bundler/* unref */.R1)(searchResults).length > 0)
                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_12, [
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_13, [
                                        (0,vue_esm_bundler/* createTextVNode */.eW)(" 検索結果: " + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(filteredPavilions).length) + "件 ", 1 /* TEXT */),
                                        ((0,vue_esm_bundler/* unref */.R1)(availablePavilionsCount) !== (0,vue_esm_bundler/* unref */.R1)(searchResults).length)
                                            ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_14, " (空き枠: " + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(availablePavilionsCount)) + "件) ", 1 /* TEXT */))
                                            : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                    ]),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_15, [
                                        (0,vue_esm_bundler/* createTextVNode */.eW)(" 選択中: " + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount)) + "時間帯 ", 1 /* TEXT */),
                                        ((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount) > 0)
                                            ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("button", {
                                                key: 0,
                                                onClick: handleClearSelection,
                                                class: "ytomo-dialog clear-selection-button"
                                            }, " 選択クリア "))
                                            : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                    ])
                                ]))
                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true),
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" パビリオン一覧 "),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_16, [
                                ((0,vue_esm_bundler/* unref */.R1)(searchResults).length === 0)
                                    ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_17, [...(_cache[6] || (_cache[6] = [
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("p", null, "パビリオンが見つかりませんでした", -1 /* CACHED */),
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("p", { class: "empty-hint" }, "検索条件を変更するか、チケットを選択してください", -1 /* CACHED */)
                                        ]))]))
                                    : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true),
                                ((0,vue_esm_bundler/* openBlock */.uX)(true), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, null, (0,vue_esm_bundler/* renderList */.pI)((0,vue_esm_bundler/* unref */.R1)(filteredPavilions), (pavilion) => {
                                    return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", {
                                        key: pavilion.id,
                                        class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-pavilion-item", { 'full-pavilion': pavilion.dateStatus === 2 }])
                                    }, [
                                        (0,vue_esm_bundler/* createCommentVNode */.Q3)(" パビリオンヘッダー "),
                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_18, [
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                                class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-star-button", { 'favorite': pavilion.isFavorite }]),
                                                onClick: ($event) => (toggleFavorite(pavilion.id, pavilion.name))
                                            }, (0,vue_esm_bundler/* toDisplayString */.v_)(pavilion.isFavorite ? '⭐' : '☆'), 11 /* TEXT, CLASS, PROPS */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_19),
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("label", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_20, [
                                                (0,vue_esm_bundler/* createElementVNode */.Lk)("input", {
                                                    type: "checkbox",
                                                    class: "ytomo-pavilion-checkbox",
                                                    checked: (0,vue_esm_bundler/* unref */.R1)(getSelectedTimeSlotsCountForPavilion)(pavilion.id) > 0,
                                                    indeterminate: isPartiallySelected(pavilion.id),
                                                    onChange: ($event) => (handlePavilionToggle(pavilion.id, $event.target.checked))
                                                }, null, 40 /* PROPS, NEED_HYDRATION */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_21)
                                            ]),
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("span", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_22, (0,vue_esm_bundler/* toDisplayString */.v_)(pavilion.name), 1 /* TEXT */),
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_23, [
                                                (pavilion.dateStatus === 2)
                                                    ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_24, " 満席 "))
                                                    : ((0,vue_esm_bundler/* unref */.R1)(getAvailableTimeSlots)(pavilion.id).length === 0)
                                                        ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_25, " 空きなし "))
                                                        : ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", PavilionTabvue_type_script_setup_true_lang_ts_hoisted_26, (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(getAvailableTimeSlots)(pavilion.id).length) + "枠 ", 1 /* TEXT */))
                                            ]),
                                            (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                                class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-expand-button", { 'expanded': expandedPavilions.value.has(pavilion.id) }]),
                                                onClick: ($event) => (toggleTimeSlotDisplay(pavilion.id))
                                            }, (0,vue_esm_bundler/* toDisplayString */.v_)(expandedPavilions.value.has(pavilion.id) ? '▲' : '▼'), 11 /* TEXT, CLASS, PROPS */, PavilionTabvue_type_script_setup_true_lang_ts_hoisted_27)
                                        ]),
                                        (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 時間帯リスト "),
                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", {
                                            class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-time-slots", { 'hidden': !expandedPavilions.value.has(pavilion.id) }])
                                        }, [
                                            ((0,vue_esm_bundler/* openBlock */.uX)(true), (0,vue_esm_bundler/* createElementBlock */.CE)(vue_esm_bundler/* Fragment */.FK, null, (0,vue_esm_bundler/* renderList */.pI)(pavilion.timeSlots, (timeSlot) => {
                                                return ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", {
                                                    key: `${pavilion.id}-${timeSlot.time}`,
                                                    class: "time-slot-item"
                                                }, [
                                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                                        class: (0,vue_esm_bundler/* normalizeClass */.C4)(["time-slot-button", {
                                                                'selected': isTimeSlotSelected(pavilion.id, timeSlot.time),
                                                                'available': timeSlot.available,
                                                                'unavailable': !timeSlot.available
                                                            }]),
                                                        disabled: !timeSlot.available,
                                                        onClick: ($event) => (handleTimeSlotSelect(pavilion.id, timeSlot))
                                                    }, [
                                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("span", _hoisted_29, (0,vue_esm_bundler/* toDisplayString */.v_)(timeSlot.time), 1 /* TEXT */),
                                                        (timeSlot.reservationType)
                                                            ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("span", _hoisted_30, (0,vue_esm_bundler/* toDisplayString */.v_)(getReservationTypeDisplay(timeSlot.reservationType)), 1 /* TEXT */))
                                                            : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                                    ], 10 /* CLASS, PROPS */, _hoisted_28)
                                                ]));
                                            }), 128 /* KEYED_FRAGMENT */)),
                                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 時間帯がない場合 "),
                                            (pavilion.timeSlots.length === 0)
                                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_31, " 利用可能な時間帯がありません "))
                                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                                        ], 2 /* CLASS */)
                                    ], 2 /* CLASS */));
                                }), 128 /* KEYED_FRAGMENT */))
                            ]),
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 予約実行ボタン "),
                            ((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount) > 0)
                                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", _hoisted_32, [
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                        onClick: handleExecuteReservation,
                                        class: "ytomo-dialog primary-button",
                                        disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading)
                                    }, " 予約実行 (" + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(selectedTimeSlotsCount)) + "時間帯) ", 9 /* TEXT, PROPS */, _hoisted_33),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                        onClick: handleMonitoringMode,
                                        class: "ytomo-dialog monitor-button",
                                        disabled: (0,vue_esm_bundler/* unref */.R1)(isLoading)
                                    }, " 監視モード ", 8 /* PROPS */, _hoisted_34)
                                ]))
                                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true)
                        ])
                    ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
            ]));
        };
    }
}));

;// ./ts/components/PavilionTab.vue?vue&type=script&setup=true&lang=ts
 
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/PavilionTab.vue?vue&type=style&index=0&id=5a57d824&scoped=true&lang=css
var PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css = __webpack_require__(363);
;// ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/PavilionTab.vue?vue&type=style&index=0&id=5a57d824&scoped=true&lang=css

      
      
      
      
      
      
      
      
      

var PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options = {};

PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options.styleTagTransform = (styleTagTransform_default());
PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options.setAttributes = (setAttributesWithoutAttributes_default());
PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options.insert = insertBySelector_default().bind(null, "head");
PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options.domAPI = (styleDomAPI_default());
PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options.insertStyleElement = (insertStyleElement_default());

var PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_update = injectStylesIntoStyleTag_default()(PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css/* default */.A, PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css_options);




       /* harmony default export */ const components_PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css = (PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css/* default */.A && PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css/* default */.A.locals ? PavilionTabvue_type_style_index_0_id_5a57d824_scoped_true_lang_css/* default */.A.locals : undefined);

;// ./ts/components/PavilionTab.vue?vue&type=style&index=0&id=5a57d824&scoped=true&lang=css

;// ./ts/components/PavilionTab.vue



;


const PavilionTab_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(PavilionTabvue_type_script_setup_true_lang_ts, [['__scopeId',"data-v-5a57d824"]])

/* harmony default export */ const PavilionTab = (PavilionTab_exports_);
;// ./node_modules/ts-loader/index.js??clonedRuleSet-1.use!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/MainDialog.vue?vue&type=script&setup=true&lang=ts


const MainDialogvue_type_script_setup_true_lang_ts_hoisted_1 = { class: "ytomo-dialog-body" };
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_2 = { class: "ytomo-tab-navigation" };
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_3 = {
    class: "ytomo-tab-count",
    id: "ticket-count"
};
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_4 = { class: "ytomo-tab-content" };
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_5 = {
    class: "ytomo-tab-dates",
    id: "pavilion-tab-dates"
};
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_6 = { class: "ytomo-tab-content" };
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_7 = { class: "ytomo-dialog-footer" };
const MainDialogvue_type_script_setup_true_lang_ts_hoisted_8 = { class: "version-info" };






/* harmony default export */ const MainDialogvue_type_script_setup_true_lang_ts = (/*@__PURE__*/(0,vue_esm_bundler/* defineComponent */.pM)({
    __name: 'MainDialog',
    setup(__props) {
        const mainDialogStore = useMainDialogStore();
        const ticketsStore = useTicketsStore();
        const pavilionsStore = usePavilionsStore();
        // ストアの状態を取得
        const { isVisible, activeTab, version } = mainDialogStore;
        const { hideDialog, setActiveTab } = mainDialogStore;
        // チケット関連の状態
        const selectedTicketCount = (0,vue_esm_bundler/* computed */.EW)(() => ticketsStore.selectedTicketCount);
        // パビリオン関連の状態（仮実装）
        const selectedPavilionCount = (0,vue_esm_bundler/* computed */.EW)(() => pavilionsStore.selectedTimeSlotsCount);
        // オーバーレイクリックでダイアログを閉じる
        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                hideDialog();
            }
        };
        // Escキーでダイアログを閉じる
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && isVisible) {
                hideDialog();
            }
        };
        // ライフサイクル
        (0,vue_esm_bundler/* onMounted */.sV)(() => {
            document.addEventListener('keydown', handleEscapeKey);
            console.log('✅ MainDialog mounted');
        });
        (0,vue_esm_bundler/* onUnmounted */.hi)(() => {
            document.removeEventListener('keydown', handleEscapeKey);
            console.log('🗑️ MainDialog unmounted');
        });
        return (_ctx, _cache) => {
            return ((0,vue_esm_bundler/* unref */.R1)(isVisible))
                ? ((0,vue_esm_bundler/* openBlock */.uX)(), (0,vue_esm_bundler/* createElementBlock */.CE)("div", {
                    key: 0,
                    class: "dialog-overlay",
                    onClick: handleOverlayClick
                }, [
                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", {
                        class: "ytomo-dialog ytomo-main-dialog",
                        onClick: _cache[3] || (_cache[3] = (0,vue_esm_bundler/* withModifiers */.D$)(() => { }, ["stop"]))
                    }, [
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_1, [
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" タブナビゲーション "),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_2, [
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                    class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-tab-button", { active: (0,vue_esm_bundler/* unref */.R1)(activeTab) === 'ticket' }]),
                                    onClick: _cache[0] || (_cache[0] = ($event) => ((0,vue_esm_bundler/* unref */.R1)(setActiveTab)('ticket'))),
                                    "data-tab": "ticket"
                                }, [
                                    _cache[4] || (_cache[4] = (0,vue_esm_bundler/* createTextVNode */.eW)(" チケット", -1 /* CACHED */)),
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("span", MainDialogvue_type_script_setup_true_lang_ts_hoisted_3, (0,vue_esm_bundler/* toDisplayString */.v_)(selectedTicketCount.value), 1 /* TEXT */)
                                ], 2 /* CLASS */),
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                    class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-tab-button", { active: (0,vue_esm_bundler/* unref */.R1)(activeTab) === 'pavilion' }]),
                                    onClick: _cache[1] || (_cache[1] = ($event) => ((0,vue_esm_bundler/* unref */.R1)(setActiveTab)('pavilion'))),
                                    "data-tab": "pavilion"
                                }, [
                                    (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_4, [
                                        _cache[5] || (_cache[5] = (0,vue_esm_bundler/* createElementVNode */.Lk)("div", { class: "ytomo-tab-title" }, "パビリオン", -1 /* CACHED */)),
                                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_5, (0,vue_esm_bundler/* toDisplayString */.v_)(selectedPavilionCount.value > 0 ? `${selectedPavilionCount.value}選択` : ''), 1 /* TEXT */)
                                    ])
                                ], 2 /* CLASS */),
                                _cache[6] || (_cache[6] = (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                    class: "ytomo-tab-button",
                                    "data-tab": "third"
                                }, [
                                    (0,vue_esm_bundler/* createCommentVNode */.Q3)(" 予備タブ ")
                                ], -1 /* CACHED */)),
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("button", {
                                    class: "ytomo-dialog-close",
                                    "aria-label": "閉じる",
                                    onClick: _cache[2] || (_cache[2] =
                                        //@ts-ignore
                                        (...args) => ((0,vue_esm_bundler/* unref */.R1)(hideDialog) && (0,vue_esm_bundler/* unref */.R1)(hideDialog)(...args)))
                                }, " × ")
                            ]),
                            (0,vue_esm_bundler/* createCommentVNode */.Q3)(" タブコンテンツ "),
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_6, [
                                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" チケットタブ "),
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", {
                                    class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-tab-pane", { active: (0,vue_esm_bundler/* unref */.R1)(activeTab) === 'ticket' }]),
                                    id: "ticket-tab"
                                }, [
                                    (0,vue_esm_bundler/* createVNode */.bF)(TicketTab)
                                ], 2 /* CLASS */),
                                (0,vue_esm_bundler/* createCommentVNode */.Q3)(" パビリオンタブ "),
                                (0,vue_esm_bundler/* createElementVNode */.Lk)("div", {
                                    class: (0,vue_esm_bundler/* normalizeClass */.C4)(["ytomo-tab-pane", { active: (0,vue_esm_bundler/* unref */.R1)(activeTab) === 'pavilion' }]),
                                    id: "pavilion-tab"
                                }, [
                                    (0,vue_esm_bundler/* createVNode */.bF)(PavilionTab)
                                ], 2 /* CLASS */)
                            ])
                        ]),
                        (0,vue_esm_bundler/* createCommentVNode */.Q3)(" フッター情報 "),
                        (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_7, [
                            (0,vue_esm_bundler/* createElementVNode */.Lk)("div", MainDialogvue_type_script_setup_true_lang_ts_hoisted_8, " 万博予約支援ツール v" + (0,vue_esm_bundler/* toDisplayString */.v_)((0,vue_esm_bundler/* unref */.R1)(version)), 1 /* TEXT */)
                        ])
                    ])
                ]))
                : (0,vue_esm_bundler/* createCommentVNode */.Q3)("v-if", true);
        };
    }
}));

;// ./ts/components/MainDialog.vue?vue&type=script&setup=true&lang=ts
 
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/MainDialog.vue?vue&type=style&index=0&id=38892410&scoped=true&lang=css
var MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css = __webpack_require__(888);
;// ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[1].rules[8].use[0]!./ts/components/MainDialog.vue?vue&type=style&index=0&id=38892410&scoped=true&lang=css

      
      
      
      
      
      
      
      
      

var MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options = {};

MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options.styleTagTransform = (styleTagTransform_default());
MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options.setAttributes = (setAttributesWithoutAttributes_default());
MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options.insert = insertBySelector_default().bind(null, "head");
MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options.domAPI = (styleDomAPI_default());
MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options.insertStyleElement = (insertStyleElement_default());

var MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_update = injectStylesIntoStyleTag_default()(MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css/* default */.A, MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css_options);




       /* harmony default export */ const components_MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css = (MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css/* default */.A && MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css/* default */.A.locals ? MainDialogvue_type_style_index_0_id_38892410_scoped_true_lang_css/* default */.A.locals : undefined);

;// ./ts/components/MainDialog.vue?vue&type=style&index=0&id=38892410&scoped=true&lang=css

;// ./ts/components/MainDialog.vue



;


const MainDialog_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(MainDialogvue_type_script_setup_true_lang_ts, [['__scopeId',"data-v-38892410"]])

/* harmony default export */ const MainDialog = (MainDialog_exports_);
;// ./ts/modules/vue-integration.ts
/**
 * Vue統合アダプター
 * 既存MainDialogFabとVue.jsシステムの橋渡し
 */




// Vue統合システム
class VueMainDialogAdapter {
    constructor(ticketManager, pavilionManager) {
        this.vueApp = null;
        this.mountPoint = null;
        this.mainDialogStore = null;
        this.ticketManager = ticketManager;
        this.pavilionManager = pavilionManager;
    }
    /**
     * Vue統合システムを初期化
     */
    async initialize() {
        console.log('🚀 Vue統合システム初期化開始');
        try {
            // マウントポイントを作成
            this.mountPoint = document.createElement('div');
            this.mountPoint.id = 'vue-main-dialog-integration';
            this.mountPoint.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
      `;
            document.body.appendChild(this.mountPoint);
            // Pinia + Vueアプリケーションを作成
            const pinia = (0,dist_pinia/* createPinia */.Ey)();
            this.vueApp = (0,vue_esm_bundler/* createApp */.Ef)(MainDialog);
            this.vueApp.use(pinia);
            // 依存関係インジェクション
            this.vueApp.provide('ticketManager', this.ticketManager);
            this.vueApp.provide('pavilionManager', this.pavilionManager);
            // Vueアプリケーションをマウント
            this.vueApp.mount(this.mountPoint);
            // ストアにアクセス
            this.mainDialogStore = useMainDialogStore();
            console.log('✅ Vue統合システム初期化完了');
            window.vueIntegration = {
                adapter: this,
                store: this.mainDialogStore,
                show: () => this.showDialog(),
                hide: () => this.hideDialog(),
                switchTab: (tab) => this.mainDialogStore?.setActiveTab(tab),
                isVisible: () => this.mainDialogStore?.isVisible
            };
        }
        catch (error) {
            console.error('❌ Vue統合システム初期化エラー:', error);
            throw error;
        }
    }
    /**
     * ダイアログを表示
     */
    showDialog() {
        if (this.mainDialogStore) {
            console.log('🎯 Vue統合ダイアログ表示');
            this.mainDialogStore.showDialog();
        }
        else {
            console.warn('⚠️ Vue統合システムが初期化されていません');
        }
    }
    /**
     * ダイアログを非表示
     */
    hideDialog() {
        if (this.mainDialogStore) {
            console.log('🎯 Vue統合ダイアログ非表示');
            this.mainDialogStore.hideDialog();
        }
    }
    /**
     * タブを切り替え
     */
    switchTab(tab) {
        if (this.mainDialogStore) {
            this.mainDialogStore.setActiveTab(tab);
            console.log(`🔄 Vue統合タブ切り替え: ${tab}`);
        }
    }
    /**
     * ダイアログの表示状態を取得
     */
    isVisible() {
        return this.mainDialogStore?.isVisible || false;
    }
    /**
     * Vue統合システムを破棄
     */
    destroy() {
        console.log('🗑️ Vue統合システム破棄');
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
        if (this.mountPoint) {
            document.body.removeChild(this.mountPoint);
            this.mountPoint = null;
        }
        this.mainDialogStore = null;
        // グローバル参照をクリア
        if (window.vueIntegration) {
            delete window.vueIntegration;
        }
    }
    /**
     * チケットマネージャーを更新
     */
    updateTicketManager(ticketManager) {
        this.ticketManager = ticketManager;
        if (this.vueApp) {
            this.vueApp.provide('ticketManager', ticketManager);
        }
    }
    /**
     * パビリオンマネージャーを更新
     */
    updatePavilionManager(pavilionManager) {
        this.pavilionManager = pavilionManager;
        if (this.vueApp) {
            this.vueApp.provide('pavilionManager', pavilionManager);
        }
    }
}
// グローバルインスタンス
let globalVueAdapter = null;
/**
 * Vue統合システムを初期化（既存システムから呼び出し）
 */
const initializeVueIntegration = async (ticketManager, pavilionManager) => {
    if (globalVueAdapter) {
        console.log('⚠️ Vue統合システムは既に初期化されています');
        return globalVueAdapter;
    }
    globalVueAdapter = new VueMainDialogAdapter(ticketManager, pavilionManager);
    await globalVueAdapter.initialize();
    return globalVueAdapter;
};
/**
 * Vue統合システムを取得
 */
const getVueIntegration = () => {
    return globalVueAdapter;
};
/**
 * Vue統合システムを破棄
 */
const destroyVueIntegration = () => {
    if (globalVueAdapter) {
        globalVueAdapter.destroy();
        globalVueAdapter = null;
    }
};
// 既存システムとの互換性用エクスポート



/***/ }),

/***/ 363:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `
.pavilion-tab[data-v-5a57d824] {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}
.search-section[data-v-5a57d824] {
  margin-bottom: 20px;
}
.div-flex[data-v-5a57d824] {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}
.ext-tomo.search[data-v-5a57d824] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
}
.ext-tomo.search[data-v-5a57d824]:focus {
  outline: none;
  border-color: #006821;
  box-shadow: 0 0 0 2px rgba(0, 104, 33, 0.2);
}
.btn-filter-without-load[data-v-5a57d824] {
  height: auto;
  min-height: 40px;
  width: auto;
  min-width: 60px;
  padding: 0px 8px;
  color: #fff;
  margin: 5px;
  background: #006821;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.btn-filter-without-load[data-v-5a57d824]:hover:not(:disabled) {
  background: #02862b;
}
.btn-filter-without-load[data-v-5a57d824]:disabled {
  background: gray;
  cursor: not-allowed;
}
.filter-section[data-v-5a57d824] {
  margin-top: 12px;
  padding: 8px 0;
}
.filter-option[data-v-5a57d824] {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.loading-section[data-v-5a57d824] {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}
.loading-spinner[data-v-5a57d824] {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #0066cc;
  border-radius: 50%;
  animation: spin-5a57d824 1s linear infinite;
}
@keyframes spin-5a57d824 {
0% { transform: rotate(0deg);
}
100% { transform: rotate(360deg);
}
}
.results-section[data-v-5a57d824] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.results-summary[data-v-5a57d824] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.results-count[data-v-5a57d824] {
  font-weight: 500;
  color: #333;
}
.selection-info[data-v-5a57d824] {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.pavilion-list[data-v-5a57d824] {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.ytomo-empty-state[data-v-5a57d824] {
  text-align: center;
  padding: 40px;
  color: #666;
}
.empty-hint[data-v-5a57d824] {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}
.ytomo-pavilion-item[data-v-5a57d824] {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}
.ytomo-pavilion-item[data-v-5a57d824]:last-child {
  border-bottom: none;
}
.ytomo-pavilion-item[data-v-5a57d824]:hover {
  background-color: #f8f9fa;
}
.ytomo-pavilion-item.full-pavilion[data-v-5a57d824] {
  opacity: 0.7;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(255, 0, 0, 0.1) 8px,
    rgba(255, 0, 0, 0.1) 16px
  );
}
.ytomo-pavilion-header[data-v-5a57d824] {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}
.ytomo-star-button[data-v-5a57d824] {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
}
.ytomo-star-button[data-v-5a57d824]:hover {
  transform: scale(1.1);
}
.ytomo-pavilion-checkbox-container[data-v-5a57d824] {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.ytomo-pavilion-checkbox[data-v-5a57d824] {
  width: 18px;
  height: 18px;
}
.ytomo-pavilion-name[data-v-5a57d824] {
  flex: 1;
  font-weight: 500;
  color: #333;
}
.pavilion-status[data-v-5a57d824] {
  margin-left: auto;
}
.status-badge[data-v-5a57d824] {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
}
.status-badge.available[data-v-5a57d824] {
  background-color: #e8f5e8;
  color: #2e7d32;
}
.status-badge.unavailable[data-v-5a57d824] {
  background-color: #fff3e0;
  color: #f57c00;
}
.status-badge.full[data-v-5a57d824] {
  background-color: #ffebee;
  color: #c62828;
}
.ytomo-expand-button[data-v-5a57d824] {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s;
}
.ytomo-expand-button[data-v-5a57d824]:hover {
  background-color: #e0e0e0;
  border-radius: 4px;
}
.ytomo-time-slots[data-v-5a57d824] {
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  background: #fafafa;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ytomo-time-slots.hidden[data-v-5a57d824] {
  display: none;
}
.time-slot-item[data-v-5a57d824] {
  margin: 0;
}
.time-slot-button[data-v-5a57d824] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}
.time-slot-button.available[data-v-5a57d824]:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}
.time-slot-button.selected[data-v-5a57d824] {
  background: #2196f3;
  color: white;
  border-color: #1976d2;
}
.time-slot-button.unavailable[data-v-5a57d824] {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}
.time-text[data-v-5a57d824] {
  font-weight: 500;
}
.reservation-type[data-v-5a57d824] {
  font-size: 10px;
  margin-top: 2px;
  opacity: 0.8;
}
.no-timeslots[data-v-5a57d824] {
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
.reservation-controls[data-v-5a57d824] {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}
.ytomo-dialog.primary-button[data-v-5a57d824] {
  background: #006821;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}
.ytomo-dialog.primary-button[data-v-5a57d824]:hover:not(:disabled) {
  background: #02862b;
}
.ytomo-dialog.primary-button[data-v-5a57d824]:disabled {
  background: gray;
  cursor: not-allowed;
}
.ytomo-dialog.monitor-button[data-v-5a57d824] {
  background: #fd7e14;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ytomo-dialog.monitor-button[data-v-5a57d824]:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.ytomo-dialog.clear-selection-button[data-v-5a57d824] {
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ytomo-dialog.clear-selection-button[data-v-5a57d824]:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
.pavilion-tab[data-v-5a57d824] {
    padding: 12px;
}
.ytomo-pavilion-header[data-v-5a57d824] {
    padding: 8px;
    gap: 8px;
}
.ytomo-time-slots[data-v-5a57d824] {
    padding: 12px;
}
.time-slot-button[data-v-5a57d824] {
    min-width: 70px;
    padding: 6px 10px;
}
.reservation-controls[data-v-5a57d824] {
    flex-direction: column;
}
}
@media (max-width: 480px) {
.div-flex[data-v-5a57d824] {
    flex-direction: column;
    gap: 8px;
}
.ext-tomo.search[data-v-5a57d824] {
    margin-right: 0;
    margin-bottom: 8px;
}
.results-summary[data-v-5a57d824] {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
}
.ytomo-pavilion-name[data-v-5a57d824] {
    font-size: 14px;
}
.time-slot-button[data-v-5a57d824] {
    min-width: 60px;
    padding: 4px 8px;
}
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 888:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `
.dialog-overlay[data-v-38892410] {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ytomo-dialog[data-v-38892410] {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.ytomo-main-dialog[data-v-38892410] {
  /* メインダイアログ特有のスタイル */
}
.ytomo-dialog-body[data-v-38892410] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ytomo-tab-navigation[data-v-38892410] {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
  min-height: 56px;
  position: relative;
}
.ytomo-tab-button[data-v-38892410] {
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  box-sizing: border-box;
}
.ytomo-tab-button[data-v-38892410]:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.04);
}
.ytomo-tab-button.active[data-v-38892410] {
  color: #0066cc;
  border-bottom-color: #0066cc;
  background: rgba(0, 102, 204, 0.04);
}
.ytomo-tab-content[data-v-38892410] {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.ytomo-tab-title[data-v-38892410] {
  font-weight: 500;
}
.ytomo-tab-dates[data-v-38892410] {
  font-size: 11px;
  color: #999;
  font-weight: normal;
}
.ytomo-tab-count[data-v-38892410] {
  background: #0066cc;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: bold;
  min-width: 16px;
  text-align: center;
  margin-left: 4px;
}
.ytomo-dialog-close[data-v-38892410] {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}
.ytomo-dialog-close[data-v-38892410]:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}
.ytomo-tab-content[data-v-38892410] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ytomo-tab-pane[data-v-38892410] {
  display: none;
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.ytomo-tab-pane.active[data-v-38892410] {
  display: flex;
  flex-direction: column;
}
.ytomo-dialog-footer[data-v-38892410] {
  padding: 12px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
}
.version-info[data-v-38892410] {
  text-align: center;
  font-size: 12px;
  color: #666;
}
.pavilion-tab-placeholder[data-v-38892410] {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-style: italic;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
.ytomo-dialog[data-v-38892410] {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
}
.ytomo-tab-navigation[data-v-38892410] {
    padding: 0 8px;
    min-height: 48px;
}
.ytomo-tab-button[data-v-38892410] {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 48px;
}
.ytomo-dialog-close[data-v-38892410] {
    right: 8px;
    font-size: 20px;
    width: 28px;
    height: 28px;
}
.ytomo-dialog-footer[data-v-38892410] {
    padding: 8px 16px;
}
}
@media (max-width: 480px) {
.ytomo-dialog[data-v-38892410] {
    width: 98vw;
    max-height: 98vh;
}
.ytomo-tab-button[data-v-38892410] {
    padding: 6px 8px;
    font-size: 12px;
}
.ytomo-tab-dates[data-v-38892410] {
    font-size: 10px;
}
.ytomo-tab-count[data-v-38892410] {
    font-size: 10px;
    padding: 1px 4px;
}
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

}]);