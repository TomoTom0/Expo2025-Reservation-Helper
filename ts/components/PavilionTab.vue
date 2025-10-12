<template>
  <div class="ytomo-pavilion-tab">
    <!-- 検索コントロールエリア -->
    <div class="ytomo-search-controls">
      <div class="ytomo-search-input-container">
        <input 
          type="text" 
          id="pavilion-search-input" 
          placeholder="パビリオン名で検索" 
          class="ytomo-search-input"
          v-model="searchInput"
          @keydown.enter="handlePavilionSearch"
        >
      </div>
      <div class="ytomo-control-buttons">
        <button 
          id="search-button" 
          class="ytomo-icon-button" 
          title="検索"
          @click="handlePavilionSearch"
          :disabled="isLoading"
        >
          <span>🔍</span>
        </button>
        <button 
          id="favorites-button" 
          class="ytomo-icon-button" 
          title="お気に入り"
          @click="handleLoadFavorites"
          :disabled="isLoading"
        >
          <span>⭐</span>
        </button>
        <div class="ytomo-button-separator"></div>
        <button 
          id="filter-button" 
          class="ytomo-icon-button" 
          :class="{ active: isAvailableOnlyFilter }"
          title="空きのみ表示"
          @click="handleToggleAvailableOnlyFilter"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
          </svg>
          <span id="available-count" class="ytomo-count-badge">{{ availablePavilionsCount }}</span>
        </button>
        <button
          id="clear-selection-button"
          class="ytomo-icon-button"
          :disabled="selectedSlotsCount === 0"
          title="選択解除"
          @click="handleClearAllSelections"
        >
          <span>✕</span>
          <span
            v-if="selectedSlotsCount > 0"
            class="ytomo-count-badge"
          >
            {{ selectedSlotsCount }}
          </span>
        </button>
        <button 
          id="schedule-button" 
          class="ytomo-icon-button ytomo-schedule-button" 
          :class="{ 
            active: scheduledReservationStore.uiState.showScheduleRow,
            running: scheduledReservationStore.executionState.isAnyScheduleRunning
          }"
          title="スケジュール予約"
          @click="handleToggleScheduleRow"
          :disabled="isLoading"
        >
          <span class="ytomo-schedule-icon">📅</span>
          <span 
            v-if="scheduledReservationStore.enabledSchedules.length > 0"
            class="ytomo-count-badge"
          >
            {{ scheduledReservationStore.enabledSchedules.length }}
          </span>
        </button>
        <div class="ytomo-button-separator"></div>
        <button 
          id="refresh-button" 
          class="ytomo-icon-button" 
          title="更新"
          @click="handleRefresh"
          :disabled="isLoading"
        >
          <span>🔄</span>
          <span 
            v-if="allPavilions.length > 0" 
            class="ytomo-count-badge"
          >
            {{ allPavilions.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- スケジュール設定行 -->
    <div 
      v-if="scheduledReservationStore.uiState.showScheduleRow" 
      class="ytomo-schedule-controls"
    >
      <div class="ytomo-schedule-form">
        <!-- 上段: ラベル、状態、保存ボタン、ダイアログボタン -->
        <div class="ytomo-form-row ytomo-header-row">
          <div class="ytomo-form-group ytomo-label-group">
            <div class="ytomo-input-with-label">
              <label class="ytomo-input-label">ラベル</label>
              <input
                type="text"
                v-model="scheduleFormData.label"
                class="ytomo-form-input ytomo-text-input"
                placeholder="予約名"
                maxlength="50"
              >
            </div>
          </div>

          <div class="ytomo-form-group ytomo-status-group">
            <button
              class="ytomo-toggle-button"
              :class="{ active: scheduleFormData.isEnabled }"
              @click="scheduleFormData.isEnabled = !scheduleFormData.isEnabled"
            >
              {{ scheduleFormData.isEnabled ? '有効' : '無効' }}
            </button>
          </div>

          <div class="ytomo-form-actions">
            <button
              class="ytomo-action-button ytomo-save-button"
              @click="handleSaveSchedule"
              :disabled="!canSaveSchedule"
            >
              保存
            </button>
            <button
              class="ytomo-action-button ytomo-dialog-button"
              @click="handleOpenScheduleDialog"
            >
              ダイアログ
            </button>
          </div>
        </div>

        <!-- 下段: 実行日時、間隔、回数を1行に -->
        <div class="ytomo-form-row ytomo-main-row">
          <div class="ytomo-form-group">
            <div class="ytomo-datetime-inputs">
              <div class="ytomo-input-with-label">
                <label class="ytomo-input-label">日付</label>
                <input
                  type="date"
                  v-model="scheduleFormData.executeDate"
                  class="ytomo-form-input ytomo-date-input"
                  :min="minScheduleDate"
                >
              </div>
              <div class="ytomo-input-with-label">
                <label class="ytomo-input-label">時刻</label>
                <input
                  type="time"
                  v-model="scheduleFormData.executeTime"
                  class="ytomo-form-input ytomo-time-input"
                >
              </div>
            </div>
          </div>

          <div class="ytomo-form-group ytomo-interval-retries-group">
            <div class="ytomo-interval-input">
              <div class="ytomo-input-with-label">
                <label class="ytomo-input-label">間隔(秒)</label>
                <input
                  inputmode="numeric"
                  v-model.number="scheduleFormData.interval"
                  class="ytomo-form-input ytomo-number-input"
                  min="5"
                  max="300"
                  placeholder="15"
                >
              </div>
            </div>
            <div class="ytomo-retries-input">
              <div class="ytomo-input-with-label">
                <label class="ytomo-input-label">回数</label>
                <input
                  inputmode="numeric"
                  v-model.number="scheduleFormData.maxRetries"
                  class="ytomo-form-input ytomo-number-input"
                  min="1"
                  max="200"
                  placeholder="10"
                >
              </div>
            </div>
          </div>
        </div>
        
        <div class="ytomo-selected-timeslots-info">
          <span class="ytomo-info-label">選択中:</span>
          <span class="ytomo-info-count">{{ scheduleSelectedSlotsCount }}件</span>
          <div class="ytomo-selected-slots-preview">
            <span 
              v-for="slot in Array.from(scheduleSelectedSlots.values()).slice(0, 3)"
              :key="`${slot.pavilionId}-${slot.timeSlot}`"
              class="ytomo-slot-preview"
            >
              {{ slot.pavilionName }} {{ formatTimeSlot(slot.timeSlot) }}
            </span>
            <span v-if="scheduleSelectedSlotsCount > 3" class="ytomo-more-slots">
              他{{ scheduleSelectedSlotsCount - 3 }}件
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- パビリオン一覧エリア -->
    <div class="ytomo-pavilion-list" id="pavilion-list-container">
      <div v-if="isLoading" class="ytomo-loading">
        <p>パビリオン情報を読み込み中...</p>
      </div>
      <div v-else-if="allPavilions.length === 0" class="ytomo-empty-state">
        <p>🔍 検索ボタンを押してパビリオンを検索してください</p>
      </div>
      <div v-else>
        <div 
          v-for="pavilion in filteredPavilions" 
          :key="pavilion.id"
          class="ytomo-pavilion-item"
          :data-pavilion-id="pavilion.id"
        >
          <div class="ytomo-pavilion-header">
            <button
              class="ytomo-star-button"
              :class="{ active: isFavorite(pavilion.id) }"
              @click="toggleFavorite(pavilion)"
            >
              {{ isFavorite(pavilion.id) ? '⭐' : '☆' }}
            </button>
            <span class="ytomo-pavilion-name">{{ pavilion.name }}</span>
            <button
              class="ytomo-official-link-button"
              @click="openOfficialPavilionPage(pavilion.id)"
              title="公式ページを開く"
            >
              🔗
            </button>
            <div class="ytomo-pavilion-status">
              <span
                v-if="(pavilion.timeSlots?.filter(slot => slot.available).length || 0) > 0"
                class="ytomo-status-available"
              >
                {{ pavilion.timeSlots?.filter(slot => slot.available).length || 0 }}枠
              </span>
              <span 
                v-else
                class="ytomo-status-full"
              >
                満員
              </span>
            </div>
          </div>
          <div class="ytomo-time-slots">
            <button
              v-for="timeSlot in getFilteredTimeSlots(pavilion)"
              :key="`${pavilion.id}-${timeSlot.time}`"
              class="ytomo-time-slot-button"
              :class="getTimeSlotClasses(pavilion.id, timeSlot)"
              :data-pavilion-id="pavilion.id"
              :data-time-slot="timeSlot.time"
              :disabled="isTimeSlotDisabledByEntranceTime(timeSlot) && !scheduledReservationStore.uiState.showScheduleRow"
              @click="handleTimeSlotClick(pavilion.id, timeSlot)"
            >
              <span class="ytomo-time-slot-text">{{ formatTimeSlot(timeSlot.time) }}</span>
              <!-- 実行状態を右上角の色で表示 -->
              <span
                v-if="pavilionsStore.getTimeSlotExecutionState(pavilion.id, timeSlot.timeSlotId || timeSlot.time)"
                class="ytomo-execution-corner"
                :class="`status-${pavilionsStore.getTimeSlotExecutionState(pavilion.id, timeSlot.timeSlotId || timeSlot.time)}`"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ENDLESSトグルボタン -->
    <Teleport to="body">
      <button
        v-if="isPavilionTabActive"
        id="endless-toggle-button"
        class="ytomo-endless-toggle"
        :class="{ active: sequentialReservationStore.state.endlessMode }"
        title="ENDLESSモード切替"
        @click="handleEndlessToggle"
      >
        ∞
      </button>
    </Teleport>

    <!-- 予約情報エリア -->
    <Teleport to="body">
      <div
        v-if="isPavilionTabActive && shouldShowReservationInfoPanel"
        class="ytomo-reservation-info-panel"
        :class="[
          { collapsed: !reservationInfoExpanded },
          `status-${getCurrentStatusClass()}`
        ]"
      >
        <!-- 折りたたみ時の表示 -->
        <div v-if="!reservationInfoExpanded" class="ytomo-info-collapsed" @click="reservationInfoExpanded = true">
          <span class="ytomo-collapsed-icon">📋</span>
        </div>

        <!-- 展開時の表示 -->
        <div v-else class="ytomo-info-expanded">
          <!-- 上段：コントロールボタン -->
          <div class="ytomo-info-top-row">
            <button
              class="ytomo-endless-button"
              :class="{ active: sequentialReservationStore.state.endlessMode }"
              @click="handleEndlessToggle"
              title="ENDLESSモード切替"
            >
              ∞
            </button>
            <select
              class="ytomo-mode-selector"
              v-model="executionMode"
              title="実行モード選択"
            >
              <option value="sequential">順次</option>
              <option value="confirm">確認</option>
              <option value="fast">高速</option>
            </select>
            <button
              class="ytomo-collapse-button"
              @click="reservationInfoExpanded = false"
              title="折り畳み"
            >
              ▼
            </button>
          </div>

          <!-- 下段：予約履歴リスト（スクロール可能） -->
          <div class="ytomo-reservation-history-list">
            <div
              v-for="item in reservationHistory"
              :key="`${item.pavilionId}-${item.index}`"
              class="ytomo-history-item"
              :class="{ 'item-running': item.status === 'Running' }"
            >
              <div class="ytomo-current-time">
                {{ item.timeSlot }}
              </div>
              <div class="ytomo-pavilion-name-truncated">
                {{ truncatePavilionName(item.pavilionName, 20) }}
              </div>
              <div class="ytomo-status" :class="getStatusClass(item.status)">
                {{ item.status }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Teleport>


    <!-- 予約実行/中断FABボタン -->
    <Teleport to="body">
      <button
        v-if="isPavilionTabActive"
        id="reservation-button"
        class="ytomo-reservation-fab"
        :class="{ 'abort-mode': sequentialReservationStore.state.isRunning }"
        :disabled="!sequentialReservationStore.state.isRunning && selectedSlotsCount === 0"
        :title="sequentialReservationStore.state.isRunning ? '順次予約を中断' : `予約実行 (${selectedSlotsCount}件選択中)`"
        @click="handleReservationExecution"
      >
        <!-- 未使用パビリオン予約警告バッジ -->
        <span
          v-if="hasUnusedPavilionReservations"
          class="ytomo-reservation-warning-badge"
          title="選択中の入場予約に未使用のパビリオン予約があります"
        >
          予約あり
        </span>

        {{ sequentialReservationStore.state.isRunning ? '中断' : '📋' }}
        <span
          v-if="!sequentialReservationStore.state.isRunning && selectedSlotsCount > 0"
          class="ytomo-count-badge"
        >
          {{ selectedSlotsCount }}
        </span>
      </button>
    </Teleport>

    
    <!-- 予約結果FAB（予約FABの左側に配置） -->
    <Teleport to="body">
      <button
        v-if="reservationResult && !reservationInfoExpanded"
        id="reservation-result-fab"
        class="ytomo-reservation-result-fab"
        :class="{
          'success': reservationResult?.success,
          'error': reservationResult && !reservationResult.success,
          'fab-blue': fabOverallColor === 'blue',
          'fab-green': fabOverallColor === 'green',
          'fab-red': fabOverallColor === 'red',
          'fab-yellow': fabOverallColor === 'yellow'
        }"
      >
        <div class="ytomo-result-status">
          {{ reservationResult.success ? '予約成功' : `予約失敗` }}
          <span v-if="!reservationResult.success && reservationResult.failureReason" class="ytomo-failure-reason">
            ({{ reservationResult.failureReason }})
          </span>
        </div>
        <div class="ytomo-result-pavilion">{{ reservationResult.pavilionName }}</div>
        <div class="ytomo-result-time">{{ reservationResult.datetime }}</div>
      </button>
    </Teleport>

    <!-- ログFAB（左下に配置） -->
    <Teleport to="body">
      <div v-if="othersStore.showDebugLogButton" class="ytomo-log-fab-container">
        <!-- ログ表示エリア（展開時） -->
        <div 
          v-if="logFabExpanded" 
          class="ytomo-log-display"
          :class="{ 'large-size': logDisplayLargeSize }"
          @click.stop
        >
          <div class="ytomo-log-header">
            <span>デバッグログ</span>
            <div class="ytomo-log-controls">
              <!-- フィルターコントロール -->
              <select v-model="selectedLogLevel" class="ytomo-log-filter">
                <option value="">全レベル</option>
                <option value="TEMP">TEMP</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
              <select v-model="selectedLogModule" class="ytomo-log-filter">
                <option value="">全モジュール</option>
                <option v-for="module in availableModules" :key="module" :value="module">{{ module }}</option>
              </select>
              <!-- アクションボタン -->
              <button @click="copyFilteredLogs" class="ytomo-log-btn" title="フィルタされたログをコピー">📋</button>
              <button @click="toggleLogDisplaySize" class="ytomo-log-btn" :title="logDisplayLargeSize ? 'サイズを小さく' : 'サイズを大きく'">{{ logDisplayLargeSize ? '🔽' : '🔼' }}</button>
              <button @click="clearLogs" class="ytomo-log-btn">クリア</button>
            </div>
          </div>
          <div class="ytomo-log-messages">
            <div 
              v-for="(log, index) in filteredLogMessages" 
              :key="index"
              class="ytomo-log-message"
              :class="`log-${log.level.toLowerCase()}`"
            >
              <span class="ytomo-log-time">{{ log.timestamp }}</span>
              <span class="ytomo-log-level">[{{ log.level }}]</span>
              <span class="ytomo-log-module">[{{ log.module }}]</span>
              <span class="ytomo-log-text">{{ log.message }}</span>
              <pre v-if="log.data" class="ytomo-log-data">{{ formatLogData(log.data) }}</pre>
            </div>
            <div v-if="filteredLogMessages.length === 0" class="ytomo-log-empty">
              {{ logMessages.length === 0 ? 'ログがありません' : 'フィルター条件に一致するログがありません' }}
            </div>
          </div>
        </div>
        
        <!-- ログFABボタン -->
        <button
          class="ytomo-log-fab"
          :class="{ 'expanded': logFabExpanded, 'has-logs': filteredLogMessages.length > 0 }"
          @click="toggleLogFab"
          title="デバッグログ"
        >
          <span class="ytomo-log-icon">📋</span>
          <span v-if="filteredLogMessages.length > 0" class="ytomo-log-count">{{ filteredLogMessages.length }}</span>
        </button>
      </div>
    </Teleport>
    
    <!-- 予約結果表示（非表示） -->
    <div 
      class="ytomo-result-display" 
      id="result-display" 
      :class="{ 'ytomo-visible': resultDisplayVisible }"
    ></div>
    
    <!-- 選択情報表示 -->
    <div class="ytomo-selected-info" id="selected-info">
    </div>
    
    <!-- スケジュール管理ダイアログ -->
    <ScheduleManagementDialog />
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ScheduleManagementDialog from '@/components/ScheduleManagementDialog.vue'
import { usePavilionsStore } from '@/stores/pavilions'
import { useTicketsStore } from '@/stores/tickets'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useOverlaysStore } from '@/stores/overlays'
import { useSequentialReservationStore } from '@/stores/sequentialReservation'
import { useScheduledReservationStore } from '@/stores/scheduledReservation'
import { useOthersStore } from '@/stores/others'
import { usePavilions } from '@/composables/usePavilions'
import type { ScheduleData, TicketData, TimeSlotData, PavilionData } from '@/types/api'
import type { ScheduleFormData, ScheduledTimeSlot } from '@/types/scheduledReservation'
import { loggers, CustomLogger } from '@/utils/logger'

// Logger setup
const logger = loggers.ui

// CustomLoggerへのイベントハンドラー登録用関数（型安全）
let logEventHandler: typeof CustomLogger.LogEventHandler | null = null

// ログレベルの型ガード
const isValidLogLevel = (level: string): level is LogMessage['level'] => {
  return ['TEMP', 'ERROR', 'WARN', 'INFO', 'DEBUG'].includes(level)
}

// ENDLESSモード切り替えハンドラ
const handleEndlessToggle = () => {
  sequentialReservationStore.setEndlessMode(!sequentialReservationStore.state.endlessMode)
  logger.info('ENDLESSモード切り替え', { enabled: sequentialReservationStore.state.endlessMode })
}

// 確認モード実行関数
const executeConfirmMode = async (reservationTargets: any[], selectedSlots: any[], entranceDate: string, registeredChannel: string, ticketIds: string[]) => {
  logger.info('確認モード実行開始', { totalTargets: reservationTargets.length })

  // 最大5個まで実行（空き状況の再確認は実際の予約実行時に行う）
  const targetsToExecute = reservationTargets.slice(0, 5)
  logger.info('確認モード：実行対象', { count: targetsToExecute.length })

  // 2秒間隔で非同期実行
  return await executeTargetsWithInterval(targetsToExecute, selectedSlots, 2000)
}

// 高速モード実行関数
const executeFastMode = async (reservationTargets: any[], selectedSlots: any[], entranceDate: string, registeredChannel: string, ticketIds: string[]) => {
  logger.info('高速モード実行開始', { totalTargets: reservationTargets.length })

  const batchSize = 5
  let currentIndex = 0
  const allResults = []

  while (currentIndex < reservationTargets.length) {
    // 現在のバッチを取得（最大5個）
    const currentBatch = reservationTargets.slice(currentIndex, currentIndex + batchSize)
    logger.info('高速モード：バッチ実行', { batchIndex: Math.floor(currentIndex / batchSize), batchSize: currentBatch.length })

    // 2秒間隔で非同期実行
    const batchResults = await executeTargetsWithInterval(currentBatch, selectedSlots, 2000)
    allResults.push(...batchResults)

    currentIndex += batchSize

    // 次のバッチがある場合は少し待機
    if (currentIndex < reservationTargets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return allResults
}

// 対象を指定間隔で実行する共通関数
const executeTargetsWithInterval = async (targets: any[], selectedSlots: any[], intervalMs: number) => {
  const results = []

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]

    try {
      const targetSlot = selectedSlots.find(slot =>
        slot.pavilionId === target.pavilionId &&
        formatTimeSlot(slot.timeSlot.time) === target.timeSlot
      )

      if (!targetSlot) {
        logger.warn('対象スロットが見つかりません', target)
        continue
      }

      logger.info('予約実行中', { pavilionName: target.pavilionName, timeSlot: target.timeSlot, index: i + 1, total: targets.length })

      const result = await pavilionsStore.executeReservation(
        target.pavilionId,
        targetSlot.timeSlot,
        target.entranceDate,
        target.registeredChannel,
        target.ticketIds
      )

      results.push({
        ...result,
        pavilionName: target.pavilionName,
        timeSlot: target.timeSlot
      })

      // 成功した場合は終了
      if (result.success) {
        logger.info('予約成功により実行終了', { pavilionName: target.pavilionName })
        break
      }

    } catch (error) {
      logger.error('個別予約実行エラー', { target, error })
      results.push({
        success: false,
        message: error instanceof Error ? error.message : '予約に失敗しました',
        pavilionName: target.pavilionName,
        timeSlot: target.timeSlot
      })
    }

    // 最後以外は間隔を空ける
    if (i < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }

  return results
}

// 予約情報エリア関連関数
const getCurrentTimeSlot = () => {
  // 結果表示中は完了した予約の情報を表示
  if (lastReservationResults.value.length > 0 && lastCompletedReservation.value) {
    return lastCompletedReservation.value.timeSlot
  }

  const currentIndex = sequentialReservationStore.state.currentTargetIndex
  const targets = sequentialReservationStore.state.reservationTargets
  const currentTarget = targets[currentIndex]
  return currentTarget?.timeSlot || '待機中'
}

const getCurrentPavilionName = () => {
  // 結果表示中は完了した予約の情報を表示
  if (lastReservationResults.value.length > 0 && lastCompletedReservation.value) {
    return lastCompletedReservation.value.pavilionName
  }

  const currentIndex = sequentialReservationStore.state.currentTargetIndex
  const targets = sequentialReservationStore.state.reservationTargets
  const currentTarget = targets[currentIndex]
  return currentTarget?.pavilionName || 'パビリオン名'
}


const getCurrentProgress = () => {
  // 結果表示中は完了した予約の進捗情報を表示
  if (lastReservationResults.value.length > 0 && lastCompletedReservation.value) {
    const { index, totalCount } = lastCompletedReservation.value
    return `[${index + 1}/${totalCount}]`
  }

  const currentIndex = sequentialReservationStore.state.currentTargetIndex
  const totalCount = sequentialReservationStore.state.reservationTargets.length
  if (totalCount === 0) return '[0/0]'
  return `[${currentIndex + 1}/${totalCount}]`
}

// パビリオン名を指定文字数で切り詰める
const truncatePavilionName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) {
    return name
  }
  return name.substring(0, maxLength) + '...'
}

const getCurrentStatus = () => {
  const isRunning = sequentialReservationStore.state.isRunning
  const countdownText = sequentialReservationStore.state.countdownText
  const currentIndex = sequentialReservationStore.state.currentTargetIndex
  const targets = sequentialReservationStore.state.reservationTargets
  const currentTarget = targets[currentIndex]

  if (!isRunning && !currentTarget) return 'Stopped'
  if (!isRunning && lastReservationResults.value.length > 0) {
    // 予約完了後の状態判定
    const hasSuccess = lastReservationResults.value.some(result => result.success === true)
    if (hasSuccess) {
      return 'Succeeded'
    } else {
      // 失敗理由を含めて表示
      const firstFailure = lastReservationResults.value.find(result => !result.success)
      if (firstFailure?.failureReason) {
        return `Failed with ${firstFailure.failureReason}`
      }
      return 'Failed with その他'
    }
  }
  if (!isRunning) return 'Stopped'

  // 予約結果がある場合は、結果表示を優先（10秒間の結果表示期間中）
  if (lastReservationResults.value.length > 0) {
    const hasSuccess = lastReservationResults.value.some(result => result.success === true)
    if (hasSuccess) {
      return 'Succeeded'
    } else {
      // 失敗理由を含めて表示
      const firstFailure = lastReservationResults.value.find(result => !result.success)
      if (firstFailure?.failureReason) {
        return `Failed with ${firstFailure.failureReason}`
      }
      return 'Failed with その他'
    }
  }

  if (countdownText) return `Waiting in ${countdownText}`
  return 'Running'
}

const getCurrentStatusClass = () => {
  const status = getCurrentStatus()
  if (status === 'Running' || status === 'Executing') return 'executing'
  if (status === 'Succeeded') return 'success'
  if (status.includes('Failed') || status.includes('failed')) return 'failed'
  if (status.includes('Waiting')) return 'waiting'
  return 'stopped'
}

const shouldShowReservationInfoPanel = computed(() => {
  return (
    sequentialReservationStore.state.isRunning ||
    reservationInfoExpanded.value ||
    lastReservationResults.value.length > 0
  )
})

// 予約履歴アイテムのステータスクラスを返す
const getStatusClass = (status: ReservationHistoryItem['status']): string => {
  if (status === 'Running') return 'status-running'
  if (status === 'Succeeded') return 'status-succeeded'
  if (status === 'Waiting') return 'status-waiting'
  if (status.includes('Failed')) return 'status-failed'
  return ''
}

// Store アクセス
const pavilionsStore = usePavilionsStore()
const ticketsStore = useTicketsStore()
const mainDialogStore = useMainDialogStore()
const overlaysStore = useOverlaysStore()
const sequentialReservationStore = useSequentialReservationStore()
const scheduledReservationStore = useScheduledReservationStore()
const othersStore = useOthersStore()

const { allPavilions, filteredPavilions, isLoading, isAvailableOnlyFilter, availablePavilionsCount } = storeToRefs(pavilionsStore)
const { activeTab } = storeToRefs(mainDialogStore)

// Composable使用
const { 
  searchPavilions,
  refreshPavilionData,
  loadFavoritePavilions, 
  toggleAvailableOnlyFilter, 
  addToFavorites, 
  removeFromFavorites,
  addSelectedTimeSlot,
  removeSelectedTimeSlot,
  isTimeSlotSelected,
  executeReservation 
} = usePavilions()

// ローカル状態
const searchInput = ref('')
const resultDisplayVisible = ref(false)

// 予約情報エリアの状態
const reservationInfoExpanded = ref(false)
let collapseTimeout: NodeJS.Timeout | null = null

// 実行モード管理
const executionMode = ref<'sequential' | 'confirm' | 'fast'>('sequential')

// 予約履歴管理
interface ReservationHistoryItem {
  pavilionId: string
  pavilionName: string
  timeSlot: string
  status: 'Waiting' | 'Running' | 'Succeeded' | 'Failed with 満席' | 'Failed with 無効' | 'Failed with その他' | 'Canceled'
  timestamp: number  // 失敗した予約を30秒後に削除するため
  index: number  // 予約対象のインデックス
}

const reservationHistory = ref<ReservationHistoryItem[]>([])

// FAB全体の色を決定
const fabOverallColor = computed(() => {
  // 実行中があれば青
  if (reservationHistory.value.some(item => item.status === 'Running')) {
    return 'blue'
  }

  // 成功があれば緑
  if (reservationHistory.value.some(item => item.status === 'Succeeded')) {
    return 'green'
  }

  // 失敗があれば赤（5秒経過していないもの）
  const now = Date.now()
  const recentFailed = reservationHistory.value.some(item =>
    (item.status === 'Failed with 満席' || item.status === 'Failed with 無効' || item.status === 'Failed with その他') &&
    (now - item.timestamp) < 5000
  )
  if (recentFailed) {
    return 'red'
  }

  // それ以外は黄色（待機中）
  return 'yellow'
})

// 予約実行結果の管理（後方互換性のため保持）
const lastReservationResults = ref<any[]>([])
const wasManuallyAborted = ref(false)
const lastCompletedReservation = ref<{pavilionName: string, timeSlot: string, index: number, totalCount: number} | null>(null)

// 予約実行時の自動展開制御
watch(() => sequentialReservationStore.state.isRunning, (isRunning) => {
  if (isRunning) {
    // 予約実行時に自動展開（自動折り畳みは行わない）
    reservationInfoExpanded.value = true
    if (collapseTimeout) {
      clearTimeout(collapseTimeout)
      collapseTimeout = null
    }
  }
  // 予約終了時は履歴を保持（次の予約開始時にリセット）
})

// スケジュールフォームデータ
const scheduleFormData = ref<ScheduleFormData>({
  label: '',
  executeDate: '',
  executeTime: '',
  interval: 15,
  maxRetries: 10,
  isEnabled: true
})

// スケジュール用選択状態管理
const scheduleSelectedSlots = ref<Map<string, ScheduledTimeSlot>>(new Map())

// 予約結果表示のためのリアクティブ状態
interface ReservationResult {
  success: boolean
  reason?: string
  failureReason?: '満席' | '無効' | 'その他'
  pavilionName: string
  datetime: string
}

const reservationResult = ref<ReservationResult | null>(null)

// ログFAB関連の状態
interface LogMessage {
  timestamp: string
  level: 'TEMP' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  module: string
  message: string
  data?: any
}

const logMessages = ref<LogMessage[]>([])
const logFabExpanded = ref(false)
const logDisplayLargeSize = ref(false)
const selectedLogLevel = ref<LogMessage['level'] | ''>('')
const selectedLogModule = ref<string>('')
const maxLogMessages = 100 // 最大保持ログ数

// フィルターされたログメッセージ（パフォーマンス最適化）
const filteredLogMessages = computed(() => {
  let filtered = logMessages.value
  
  if (selectedLogLevel.value) {
    filtered = filtered.filter(log => log.level === selectedLogLevel.value)
  }
  
  if (selectedLogModule.value) {
    filtered = filtered.filter(log => log.module === selectedLogModule.value)
  }
  
  // 新しい順に表示（reverseはリアルタイムでのみ実行）
  return [...filtered].reverse()
})

// 利用可能なモジュール一覧
const availableModules = computed(() => {
  const modules = new Set(logMessages.value.map(log => log.module))
  return Array.from(modules).sort()
})

// 計算プロパティ
// パビリオンタブがアクティブかどうか
const isPavilionTabActive = computed(() => activeTab.value === 'pavilion')

// 現在表示されているパビリオンの選択時間帯数のみを計算
const selectedSlotsCount = computed(() => {
  const filteredPavilionIds = new Set(pavilionsStore.filteredPavilions.map(p => p.id))
  return pavilionsStore.selectedTimeSlots.filter(slot =>
    filteredPavilionIds.has(slot.pavilionId)
  ).length
})

// 選択中の入場予約に未使用のパビリオン予約があるかチェック
const hasUnusedPavilionReservations = computed(() => {
  return ticketsStore.hasUnusedPavilionReservationsInSelected()
})

// 予約管理システムから選択されたスケジュール一覧を取得
const selectedSchedules = computed(() => {
  const selected: ScheduleData[] = []
  const selectedReservationIds = ticketsStore.getSelectedReservationIds()

  selectedReservationIds.forEach(reservationId => {
    const { schedule } = ticketsStore.getScheduleByReservationId(reservationId)
    if (schedule) {
      selected.push(schedule)
    }
  })
  return selected
})


// 分散状態管理から選択された入場日付を取得
const selectedEntranceDate = computed(() => {
  return selectedSchedules.value.length > 0 ? selectedSchedules.value[0].entrance_date : null
})

// 選択された入場予約のうち、最も遅い入場時刻+10分を取得（HH:MM形式）
const getLatestEntranceTime = (): string => {
  if (selectedSchedules.value.length === 0) {
    return ''
  }
  
  // 各スケジュールの日時文字列を比較可能な形式に変換して最新を取得
  const latest = selectedSchedules.value.reduce((latest, current) => {
    const latestDateTime = `${latest.entrance_date}${latest.time_start || '0000'}`
    const currentDateTime = `${current.entrance_date}${current.time_start || '0000'}`
    return currentDateTime > latestDateTime ? current : latest
  })
  
  
  // time_startをHH:MM形式に変換
  let timeStr = latest.time_start || ''
  
  // 時間をそのまま使用（10分後→ちょうど以降に変更）
  if (timeStr && timeStr.includes(':')) {
    return timeStr
  }
  
  return ''
}

// 選択された入場予約のうち、最も遅い入場日時を取得（表示用）
const latestEntranceDateTime = computed(() => {
  if (selectedSchedules.value.length === 0) return ''
  
  // 各スケジュールの日時文字列を比較可能な形式に変換して最新を取得
  const latest = selectedSchedules.value.reduce((latest, current) => {
    const latestDateTime = `${latest.entrance_date}${latest.time_start || '0000'}`
    const currentDateTime = `${current.entrance_date}${current.time_start || '0000'}`
    return currentDateTime > latestDateTime ? current : latest
  })
  
  // 日時を表示形式に変換
  const date = latest.entrance_date
  let timeDisplay = ''
  
  if (latest.schedule_name) {
    // 末尾の「-」を除去
    timeDisplay = latest.schedule_name.replace(/-$/, '')
  } else if (latest.time_start) {
    // HHMMまたはHH:MM形式をHH:MM形式に統一
    const timeStr = latest.time_start.replace(':', '')
    if (timeStr.length === 4) {
      timeDisplay = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`
    } else {
      timeDisplay = latest.time_start
    }
  }
  
  // 日付をMM/DD形式に変換（formatDate()と同じ処理）
  if (date && date.length === 8) {
    const year = date.slice(0, 4)
    const month = date.slice(4, 6)
    const day = date.slice(6, 8)
    const dateObj = new Date(`${year}-${month}-${day}`)
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
    return timeDisplay ? `${formattedDate} ${timeDisplay}` : formattedDate
  }
  
  return timeDisplay || date || ''
})

const availableCount = computed(() => {
  return allPavilions.value.reduce((count: number, pavilion: any) => {
    return count + (pavilion.timeSlots?.filter((slot: any) => slot.available).length || 0)
  }, 0)
})

// ログFAB関連のメソッド
const toggleLogFab = () => {
  logFabExpanded.value = !logFabExpanded.value
}

const clearLogs = () => {
  logMessages.value = []
}

const toggleLogDisplaySize = () => {
  logDisplayLargeSize.value = !logDisplayLargeSize.value
}

const copyFilteredLogs = async () => {
  const logText = filteredLogMessages.value.map(log => {
    let text = `[${log.timestamp}] [${log.level}] [${log.module}] ${log.message}`
    if (log.data) {
      text += `\n${formatLogData(log.data)}`
    }
    return text
  }).join('\n')
  
  try {
    await navigator.clipboard.writeText(logText)
    logger.info('フィルタされたログをコピーしました', { count: filteredLogMessages.value.length })
  } catch (error) {
    logger.error('コピーに失敗しました', error)
  }
}

const addLogMessage = (level: LogMessage['level'], module: string, message: string, data?: any) => {
  // ログレベルの型安全性チェック
  if (!isValidLogLevel(level)) {
    console.warn(`Invalid log level: ${level}`)
    return
  }
  
  const timestamp = new Date().toLocaleTimeString('ja-JP', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  const logMessage: LogMessage = {
    timestamp,
    level,
    module,
    message,
    data
  }
  
  // メモリ効率的な配列操作：最大数を超えた場合は先頭を削除
  if (logMessages.value.length >= maxLogMessages) {
    logMessages.value.shift()
  }
  logMessages.value.push(logMessage)
}

const formatLogData = (data: any): string => {
  if (data === null || data === undefined) {
    return ''
  }
  
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return String(data)
  }
}

// メソッド
// キャンセル制御
let currentAbortController: AbortController | null = null

const handlePavilionSearch = async () => {
  try {
    logger.info('パビリオン検索開始', { query: searchInput.value })

    // 前回の処理をキャンセル
    if (currentAbortController) {
      currentAbortController.abort()
    }

    // 新しいAbortControllerを作成
    currentAbortController = new AbortController()

    overlaysStore.showProcessingOverlay('パビリオンを検索中...', () => {
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }
    })

    // 選択されたチケットIDsを取得
    const ticketIds = ticketsStore.selectedTicketIds

    // デバッグ: チケット選択状態を確認
    logger.temp('チケット選択状態デバッグ', {
      全チケット数: ticketsStore.ticketsArray.length,
      全チケット: ticketsStore.ticketsArray.map(t => ({
        ticket_id: t.ticket_id,
        label: t.label,
        schedules: t.schedules?.map(s => ({
          entrance_date: s.entrance_date,
          schedule_name: s.schedule_name,
          selected: s.selected
        })) || []
      })),
      選択済みチケット数: ticketsStore.selectedTicketIds.length,
      選択済みチケットIDs: ticketIds
    })

    // 選択された入場日付を取得
    const entranceDate = selectedEntranceDate.value

    // 入場予約から正しいパビリオン予約種類を取得
    const pavilionReservationInfo = ticketsStore.selectedPavilionReservationInfo
    const registeredChannel = pavilionReservationInfo?.activeChannel || '4' // デフォルトはfast

    logger.info('検索パラメータ', {
      query: searchInput.value.trim(),
      ticketIds: ticketIds.length,
      entranceDate,
      registeredChannel
    })

    // パビリオン検索実行
    const results = await searchPavilions(
      searchInput.value.trim(),
      ticketIds,
      entranceDate || undefined
    )

    // キャンセルされた場合は処理を中断
    if (currentAbortController.signal.aborted) {
      logger.info('パビリオン検索がキャンセルされました')
      return
    }

    // 検索直後は空きのみフィルタを自動ON（旧仕様に合わせる）
    if (!isAvailableOnlyFilter.value) {
      toggleAvailableOnlyFilter()
      logger.info('検索後に空きのみフィルター自動ON')
    }

    logger.info('パビリオン検索完了', { count: results.length })
    overlaysStore.hideProcessingOverlay()
    currentAbortController = null
  } catch (error) {
    logger.error('パビリオン検索エラー', error)
    overlaysStore.hideProcessingOverlay()
    currentAbortController = null
  }
}

const handleLoadFavorites = async () => {
  try {
    logger.info('お気に入り読み込み開始')

    // 前回の処理をキャンセル
    if (currentAbortController) {
      currentAbortController.abort()
    }

    // 新しいAbortControllerを作成
    currentAbortController = new AbortController()

    overlaysStore.showProcessingOverlay('お気に入りを読み込み中...', () => {
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }
    })

    // 選択されたチケットIDsを取得
    const ticketIds = ticketsStore.selectedTicketIds

    // 選択された入場日付を取得
    const entranceDate = selectedEntranceDate.value

    const results = await loadFavoritePavilions(entranceDate || undefined, ticketIds)

    // キャンセルされた場合は処理を中断
    if (currentAbortController.signal.aborted) {
      logger.info('お気に入り読み込みがキャンセルされました')
      return
    }

    // お気に入り読み込み後はフィルターをOFFにして全て表示
    if (isAvailableOnlyFilter.value) {
      toggleAvailableOnlyFilter()
      logger.info('お気に入り読み込み後にフィルターOFF')
    }

    logger.info('お気に入り読み込み完了', {
      loadedCount: results.length,
      displayCount: allPavilions.value.length,
      favoriteNames: results.map(p => p.name)
    })

    overlaysStore.hideProcessingOverlay()
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.info('お気に入り読み込みがキャンセルされました')
    } else {
      logger.error('お気に入り読み込みエラー', error)
    }
    overlaysStore.hideProcessingOverlay()
  } finally {
    currentAbortController = null
  }
}

const handleToggleAvailableOnlyFilter = () => {
  toggleAvailableOnlyFilter()
  logger.info('空きのみフィルター切り替え', { enabled: isAvailableOnlyFilter.value })
}

const handleRefresh = async () => {
  try {
    logger.info('データ更新開始（選択リセットなし）')

    // 前回の処理をキャンセル
    if (currentAbortController) {
      currentAbortController.abort()
    }

    // 新しいAbortControllerを作成
    currentAbortController = new AbortController()

    overlaysStore.showProcessingOverlay('パビリオン情報を更新中...', () => {
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }
    })

    // 選択されたチケットIDsを取得
    const ticketIds = ticketsStore.selectedTicketIds

    // 選択された入場日付を取得
    const entranceDate = selectedEntranceDate.value

    await refreshPavilionData(ticketIds, entranceDate || undefined)

    // キャンセルされた場合は処理を中断
    if (currentAbortController.signal.aborted) {
      logger.info('データ更新がキャンセルされました')
      return
    }

    overlaysStore.hideProcessingOverlay()
    currentAbortController = null
  } catch (error) {
    logger.error('データ更新エラー', error)
    overlaysStore.hideProcessingOverlay()
    currentAbortController = null
  }
}


// お気に入り状態をリアクティブに判定
const isFavorite = (pavilionId: string) => {
  return pavilionsStore.favoriteIds.has(pavilionId)
}

const toggleFavorite = (pavilion: any) => {
  if (isFavorite(pavilion.id)) {
    removeFromFavorites(pavilion.id)
    logger.info('お気に入り削除', { pavilionName: pavilion.name })
  } else {
    addToFavorites(pavilion.id, pavilion.name)
    logger.info('お気に入り追加', { pavilionName: pavilion.name })
  }
}

// 公式パビリオンページを開く
const openOfficialPavilionPage = (pavilionId: string) => {
  logger.info('公式パビリオンページを開く', { pavilionId })

  // 選択されたチケットIDを取得
  const selectedTicketIdList = ticketsStore.selectedTicketIds
  if (selectedTicketIdList.length === 0) {
    logger.warn('チケットが選択されていません')
    alert('チケットを選択してください')
    return
  }
  const ticketIds = selectedTicketIdList.join(',')

  // 入場日付を取得
  const entranceDate = selectedEntranceDate.value
  if (!entranceDate) {
    logger.warn('入場日付が選択されていません')
    alert('入場日付を選択してください')
    return
  }

  // URLを生成（他のモジュールと同じ形式）
  const pavilionUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionId}&screen_id=108&lottery=5&entrance_date=${entranceDate}`

  // 新しいタブで公式パビリオンページを開く
  const newTab = window.open(pavilionUrl, '_blank')

  if (newTab) {
    logger.info('公式パビリオンページを開きました', { pavilionId, url: pavilionUrl })
  } else {
    logger.warn('新しいタブを開けませんでした（ポップアップブロック？）', { pavilionId })
  }
}

const getFilteredTimeSlots = (pavilion: any) => {
  if (!pavilion.timeSlots) return []
  
  // フィルターONの場合は空きのある時間帯のみ表示
  if (isAvailableOnlyFilter.value) {
    return pavilion.timeSlots.filter((slot: TimeSlotData) => slot.available)
  }
  
  // フィルターOFFの場合は全時間帯を表示
  return pavilion.timeSlots
}

const getTimeSlotClasses = (pavilionId: string, timeSlot: TimeSlotData) => {
  const classes = []

  if (timeSlot.available) {
    classes.push('available')
    // 残りわずかの場合はlimitedクラスも追加
    if (timeSlot.availabilityStatus === 'limited') {
      classes.push('limited')
    }
  } else {
    classes.push('unavailable', 'full')
  }

  // スケジュールモードの場合はスケジュール選択状態をチェック
  if (scheduledReservationStore.uiState.showScheduleRow) {
    const slotKey = `${pavilionId}-${timeSlot.time}`
    if (scheduleSelectedSlots.value.has(slotKey)) {
      classes.push('schedule-selected')
    }
  } else {
    // 通常モードの場合は通常選択状態をチェック
    if (isTimeSlotSelected(pavilionId, timeSlot.time)) {
      classes.push('selected')
    }
  }

  // 実行状態に応じたクラスを追加
  const executionState = pavilionsStore.getTimeSlotExecutionState(pavilionId, timeSlot.timeSlotId || timeSlot.time)
  if (executionState) {
    classes.push(`execution-${executionState}`)
  }

  return classes
}

const handleTimeSlotClick = (pavilionId: string, timeSlot: TimeSlotData) => {
  // スケジュールモードの場合は別処理
  if (scheduledReservationStore.uiState.showScheduleRow) {
    handleScheduleTimeSlotClick(pavilionId, timeSlot)
    return
  }

  const pavilion = pavilionsStore.pavilions.get(pavilionId)
  if (!pavilion) return

  // 満員時間帯でも選択可能（監視機能のため）
  if (!timeSlot.available) {
    logger.info('満員時間帯クリック（選択）', { pavilionId, timeSlot: timeSlot.time })
  } else {
    logger.info('空き時間帯クリック（選択）', { pavilionId, timeSlot: timeSlot.time })
  }
  
  // 空き時間帯クリック → 選択状態を切り替え
  const isSelected = isTimeSlotSelected(pavilionId, timeSlot.time)
  
  if (isSelected) {
    // 選択解除
    removeSelectedTimeSlot(pavilionId, timeSlot.time)
    logger.info('時間帯選択解除', { pavilionName: pavilion.name, timeSlot: timeSlot.time })
  } else {
    // 選択追加
    const selection = {
      pavilionId,
      pavilionName: pavilion.name,
      timeSlot: {
        ...timeSlot,
        selected: true,
        reservationType: timeSlot.reservationType || 'normal'
      },
      entranceDate: selectedEntranceDate.value || ''
    }
    addSelectedTimeSlot(selection)
    logger.info('時間帯選択追加', { pavilionName: pavilion.name, timeSlot: timeSlot.time })
  }
}

const handleReservationExecution = async () => {
  // 順次予約実行中の場合は中断処理
  if (sequentialReservationStore.state.isRunning) {
    wasManuallyAborted.value = true // 手動中断フラグを設定
    sequentialReservationStore.stopSequentialReservation()
    logger.info('順次予約を中断しました')
    return
  }

  if (selectedSlotsCount.value === 0) {
    logger.warn('選択された時間帯なし')
    return
  }
  
  try {
    // 予約実行フラグをリセット
    wasManuallyAborted.value = false
    lastReservationResults.value = []

    logger.temp('予約実行開始', { selectedCount: selectedSlotsCount.value })
    
    // 現在表示されているパビリオンの選択時間帯のみを取得
    const filteredPavilionIds = new Set(pavilionsStore.filteredPavilions.map(p => p.id))
    const selectedSlots = pavilionsStore.selectedTimeSlots.filter(slot => 
      filteredPavilionIds.has(slot.pavilionId)
    )
    const entranceDate = selectedEntranceDate.value || ''
    
    // 入場予約から正しいパビリオン予約種類を取得
    const pavilionReservationInfo = ticketsStore.selectedPavilionReservationInfo
    if (!pavilionReservationInfo?.activeChannel) {
      throw new Error('パビリオン予約種類が特定できません')
    }
    const registeredChannel = pavilionReservationInfo.activeChannel
    
    // 選択されたチケットIDsを取得
    const ticketIds = ticketsStore.selectedTicketIds
    
    if (ticketIds.length === 0) {
      throw new Error('チケットが選択されていません')
    }

    // 予約対象をReservationTarget形式に変換
    const reservationTargets = selectedSlots.map(selection => ({
      pavilionId: selection.pavilionId,
      pavilionName: selection.pavilionName,
      timeSlot: formatTimeSlot(selection.timeSlot.time),
      entranceDate,
      registeredChannel,
      ticketIds
    }))

    // 予約履歴を初期化（Running 1つ + Waiting 1つのみ）
    reservationHistory.value = []

    // 最初の予約をRunningとして追加
    if (reservationTargets.length > 0) {
      reservationHistory.value.push({
        pavilionId: reservationTargets[0].pavilionId,
        pavilionName: reservationTargets[0].pavilionName,
        timeSlot: reservationTargets[0].timeSlot,
        status: 'Running' as const,
        timestamp: Date.now(),
        index: 0
      })
    }

    // 2つ目があればWaitingとして追加
    if (reservationTargets.length > 1) {
      reservationHistory.value.push({
        pavilionId: reservationTargets[1].pavilionId,
        pavilionName: reservationTargets[1].pavilionName,
        timeSlot: reservationTargets[1].timeSlot,
        status: 'Waiting' as const,
        timestamp: Date.now(),
        index: 1
      })
    }

    // 予約履歴管理関数
    const addHistory = (target: any, status: ReservationHistoryItem['status']) => {
      const exists = reservationHistory.value.find(
        item => item.pavilionId === target.pavilionId &&
                item.timeSlot === target.timeSlot &&
                (item.status === 'Waiting' || item.status === 'Running')
      )
      if (!exists) {
        reservationHistory.value.push({
          pavilionId: target.pavilionId,
          pavilionName: target.pavilionName,
          timeSlot: target.timeSlot,
          status,
          timestamp: Date.now(),
          index: -1
        })
      }
    }

    const updateHistory = (target: any, newStatus: ReservationHistoryItem['status']) => {
      const item = reservationHistory.value.find(
        item => item.pavilionId === target.pavilionId &&
                item.timeSlot === target.timeSlot
      )
      if (item) {
        item.status = newStatus
        item.timestamp = Date.now()
      }
    }

    const deleteHistory = (target: any) => {
      reservationHistory.value = reservationHistory.value.filter(
        item => !(item.pavilionId === target.pavilionId && item.timeSlot === target.timeSlot)
      )
    }

    const cancelAllWaiting = () => {
      reservationHistory.value.forEach(item => {
        if (item.status === 'Waiting') {
          item.status = 'Canceled'
          item.timestamp = Date.now()
        }
      })
    }

    let results: any[] = []

    // 実行モードに応じて処理を分岐
    const endlessMode = sequentialReservationStore.state.endlessMode

    switch (executionMode.value) {
      case 'sequential':
        // 従来の順次実行
        sequentialReservationStore.startSequentialReservation(reservationTargets, endlessMode, false)
        results = await sequentialReservationStore.executeSequentialReservation(
          pavilionsStore.executeReservation,
          selectedSlots,
          formatTimeSlot,
          logger,
          addHistory,
          updateHistory,
          deleteHistory,
          cancelAllWaiting
        )
        break

      case 'confirm':
        // 確認モード：空きがある対象を最大5個まで2秒間隔で非同期実行
        results = await executeConfirmMode(reservationTargets, selectedSlots, entranceDate, registeredChannel, ticketIds)
        break

      case 'fast':
        // 高速モード：最大5個まで2秒間隔で非同期実行、次周期で次の優先度
        results = await executeFastMode(reservationTargets, selectedSlots, entranceDate, registeredChannel, ticketIds)
        break
    }

    // 結果を保存（自動折り畳み判定用）
    lastReservationResults.value = results

    // 現在の予約情報を保存（結果表示用）
    const targets = sequentialReservationStore.state.reservationTargets
    const totalCount = targets.length

    // 最後に実行された予約の情報を保存（一種類選択時と二週目に対応）
    if (results.length > 0) {
      // 実際に実行された予約の最後の結果から情報を取得
      const lastResult = results[results.length - 1]

      // 結果から直接パビリオン名と時間帯を取得（ENDLESSモード二週目対応）
      const pavilionName = lastResult.details?.pavilionName || lastResult.pavilionName || 'パビリオン名'
      const timeSlot = lastResult.details?.timeSlot || lastResult.timeSlot || '時間帯'

      lastCompletedReservation.value = {
        pavilionName: pavilionName,
        timeSlot: timeSlot,
        index: results.length - 1, // 実際に実行された予約の最後のインデックス
        totalCount: reservationTargets.length
      }

      // 10秒後にクリア
      setTimeout(() => {
        lastCompletedReservation.value = null
        lastReservationResults.value = []
      }, 10000)
    }

    // 成功した予約数をカウント
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    logger.temp('予約実行完了', { successCount, failureCount })
    
    // 結果詳細をログ出力
    results.forEach(result => {
      if (result.details) {
        if (result.success) {
          logger.info('予約成功', {
            pavilionName: result.details.pavilionName,
            timeSlot: result.details.timeSlot,
            message: result.message
          })
        } else {
          logger.warn('予約失敗', {
            pavilionName: result.details.pavilionName,
            timeSlot: result.details.timeSlot,
            message: result.message
          })
        }
      }
    })
    
    // 継続予約の場合はダイアログは隠さない（sequentialReservationStoreで管理）
    overlaysStore.hideProcessingOverlay()
    
    // 予約結果を直接表示
    results.forEach(result => {
      if (result.details) {
        const formattedResult = {
          success: result.success,
          reason: result.success ? undefined : result.message,
          pavilionName: result.details.pavilionName || '',
          datetime: `${formatDate(entranceDate)} ${result.details.timeSlot || ''}`
        }

        showReservationResult(formattedResult)
      }
    })
    
    // 結果メッセージ表示は showReservationResult内で管理
    
  } catch (error) {
    logger.error('継続予約実行エラー', error)
    sequentialReservationStore.stopSequentialReservation()
  }
}


// ENDLESS OFF時の予約失敗後時間帯情報非同期更新
const updateTimeSlotInfoAsync = async () => {
  try {
    logger.info('予約失敗後の時間帯情報非同期更新を実行中')
    
    // 選択されたチケットIDsを取得
    const ticketIds = ticketsStore.selectedTicketIds
    
    if (ticketIds.length === 0) {
      logger.warn('時間帯情報更新: チケットが選択されていません')
      return
    }
    
    // 選択された入場日付を取得
    const entranceDate = selectedEntranceDate.value
    if (!entranceDate) {
      logger.warn('時間帯情報更新: 入場日付が選択されていません')
      return
    }
    
    // 現在の検索クエリを取得（最後の検索を再実行）
    const currentQuery = searchInput.value.trim()
    
    // refreshPavilionsメソッドを使用して時間帯情報を更新
    await pavilionsStore.refreshPavilions(currentQuery, ticketIds, entranceDate)
    
    logger.info('予約失敗後の時間帯情報非同期更新完了')
    
  } catch (error) {
    logger.error('時間帯情報非同期更新でエラー', { 
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// 予約結果表示関数
const showReservationResult = (result: ReservationResult) => {
  // 時刻フォーマット（HHMMをHH:MMに変換）
  const formatTime = (timeStr: string): string => {
    const match = timeStr.match(/(\d{2})(\d{2})/)
    if (match) {
      return `${match[1]}:${match[2]}`
    }
    return timeStr
  }

  // エラーメッセージの日本語化
  const translateErrorMessage = (reason: string): string => {
    if (reason.includes('select ticket valid error')) {
      return '無効'
    }
    return reason
  }

  // 時刻フォーマットを修正
  const formattedResult = {
    ...result,
    datetime: result.datetime.replace(/(\d{4})$/, (match) => formatTime(match)),
    reason: result.reason ? translateErrorMessage(result.reason) : undefined
  }
  
  reservationResult.value = formattedResult
  
  // 10秒後に自動で非表示
  setTimeout(() => {
    reservationResult.value = null
  }, 10000)
}

// スケジュール関連の計算プロパティ
const minScheduleDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const scheduleSelectedSlotsCount = computed(() => {
  return scheduleSelectedSlots.value.size
})

const canSaveSchedule = computed(() => {
  return scheduleFormData.value.label.trim() !== '' &&
         scheduleFormData.value.executeDate !== '' &&
         scheduleFormData.value.executeTime !== '' &&
         scheduleSelectedSlotsCount.value > 0
})

// スケジュール関連メソッド
const handleToggleScheduleRow = () => {
  scheduledReservationStore.toggleScheduleRow()
  
  // 表示切り替え時に初期化
  if (scheduledReservationStore.uiState.showScheduleRow) {
    resetScheduleForm()
    scheduleSelectedSlots.value.clear()
  }
}

const resetScheduleForm = () => {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  scheduleFormData.value = {
    label: `予約${now.getMonth() + 1}/${now.getDate()}`,
    executeDate: tomorrow.toISOString().split('T')[0],
    executeTime: '09:00',
    interval: 15,
    maxRetries: 10,
    isEnabled: true
  }
}

const handleScheduleTimeSlotClick = (pavilionId: string, timeSlot: TimeSlotData) => {
  const pavilion = pavilionsStore.pavilions.get(pavilionId)
  if (!pavilion) return

  const slotKey = `${pavilionId}-${timeSlot.time}`
  const entranceDate = selectedEntranceDate.value || ''
  
  if (scheduleSelectedSlots.value.has(slotKey)) {
    // 選択解除
    scheduleSelectedSlots.value.delete(slotKey)
    logger.info('スケジュール時間帯選択解除', { 
      pavilionName: pavilion.name, 
      timeSlot: timeSlot.time 
    })
  } else {
    // 選択追加
    const scheduledSlot: ScheduledTimeSlot = {
      pavilionId,
      pavilionName: pavilion.name,
      timeSlot: timeSlot.time,
      entranceDate: entranceDate
    }
    scheduleSelectedSlots.value.set(slotKey, scheduledSlot)
    logger.info('スケジュール時間帯選択追加', { 
      pavilionName: pavilion.name, 
      timeSlot: timeSlot.time 
    })
  }
}

const handleSaveSchedule = () => {
  if (!canSaveSchedule.value) {
    logger.warn('スケジュール保存: 必要項目が不足')
    return
  }

  const timeSlots = Array.from(scheduleSelectedSlots.value.values())
  const scheduleId = scheduledReservationStore.createScheduledReservation(
    scheduleFormData.value,
    timeSlots
  )

  logger.info('スケジュール予約を保存', { 
    scheduleId, 
    label: scheduleFormData.value.label,
    timeSlotsCount: timeSlots.length 
  })

  // フォームをリセット
  resetScheduleForm()
  scheduleSelectedSlots.value.clear()
}

const handleOpenScheduleDialog = () => {
  scheduledReservationStore.showScheduleDialog()
}

// すべての選択解除
const handleClearAllSelections = () => {
  const beforeCount = pavilionsStore.selectedTimeSlots.length

  // pavilionsStoreの選択状態をクリア
  pavilionsStore.clearSelectedTimeSlots()

  // スケジュール選択スロットもクリア
  scheduleSelectedSlots.value.clear()

  logger.info('すべての時間帯選択を解除しました', {
    clearedSlots: beforeCount,
    remainingSlots: pavilionsStore.selectedTimeSlots.length
  })
}

// ヘルパー関数
const formatDate = (dateStr: string | null): string => {
  // YYYYMMDD形式（例：20250826）をパース
  if (dateStr && dateStr.length === 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  return dateStr || ''
}

// 入場時刻制約により時間帯がdisabledかどうかを判定
const isTimeSlotDisabledByEntranceTime = (timeSlot: TimeSlotData): boolean => {
  const latestEntranceTime = getLatestEntranceTime()
  if (!latestEntranceTime) return false

  // 時間帯の開始時間をHH:MM形式に変換
  const slotStartTime = formatTimeSlot(timeSlot.time)
  if (!slotStartTime) return false

  // 時刻を分単位に変換して正確な比較を行う
  const slotMinutes = convertTimeToMinutes(slotStartTime)
  const entranceMinutes = convertTimeToMinutes(latestEntranceTime)

  // パビリオン体験は入場時刻より後でないといけない（入場してから体験するため）
  const isDisabled = slotMinutes <= entranceMinutes

  return isDisabled
}

// 時刻文字列（HH:MM）を分単位の数値に変換
const convertTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTimeSlot = (timeStr: string): string => {
  // HHMM形式（例：1040, 1100）をHH:MM形式に変換
  if (timeStr && timeStr.length === 4) {
    const hour = timeStr.slice(0, 2)
    const minute = timeStr.slice(2, 4)
    return `${hour}:${minute}`
  }
  // 既にHH:MM形式の場合はそのまま返す
  if (timeStr && timeStr.includes(':')) {
    return timeStr
  }
  return timeStr || ''
}


// スケジュール実行イベントハンドラ
const handleScheduleExecuteReservation = async (event: Event) => {
  const customEvent = event as CustomEvent
  const { scheduleId, schedule, executionRecord } = customEvent.detail
  
  logger.info('スケジュール実行イベント受信', { 
    scheduleId, 
    label: schedule.label,
    timeSlotsCount: schedule.selectedTimeSlots.length 
  })

  try {
    // Sequential Reservation用のターゲットに変換
    const reservationTargets = schedule.selectedTimeSlots.map((slot: any) => ({
      pavilionId: slot.pavilionId,
      pavilionName: slot.pavilionName,
      timeSlot: formatTimeSlot(slot.timeSlot),
      entranceDate: slot.entranceDate,
      registeredChannel: '4', // デフォルトはfast
      ticketIds: [] // チケットIDは現在の選択状態から取得
    }))

    // 選択されたチケットIDを取得
    const ticketIds = ticketsStore.selectedTicketIds

    if (ticketIds.length === 0) {
      throw new Error('チケットが選択されていません')
    }

    // チケットIDを設定
    reservationTargets.forEach((target: any) => {
      target.ticketIds = ticketIds
    })

    logger.info('スケジュール予約実行開始', {
      scheduleId,
      targetsCount: reservationTargets.length,
      interval: schedule.interval,
      maxRetries: schedule.maxRetries
    })

    // Sequential Reservationで予約実行（オーバーレイ非表示）
    sequentialReservationStore.startSequentialReservation(reservationTargets, false, false)
    
    // 特別な設定で実行（スケジュール用のカスタマイズ）
    const results = await sequentialReservationStore.executeSequentialReservation(
      pavilionsStore.executeReservation,
      [], // selectedSlotsはスケジュールでは不要
      formatTimeSlot,
      logger
    )

    // 結果をスケジュールストアに反映
    const successCount = results.filter(r => r.success).length
    const success = successCount > 0
    
    scheduledReservationStore.updateScheduleExecutionResult(
      scheduleId,
      success,
      success ? undefined : `${results.length - successCount}件失敗`
    )

    logger.info('スケジュール予約実行結果', {
      scheduleId,
      successCount,
      totalCount: results.length,
      overallSuccess: success
    })

    // 成功時のみグローバル通知を表示
    if (success && typeof (window as any).showReservationNotification === 'function') {
      const message = successCount === results.length 
        ? `スケジュール予約成功: ${schedule.label} (${successCount}件)`
        : `スケジュール予約一部成功: ${schedule.label} (${successCount}/${results.length}件)`
      
      ;(window as any).showReservationNotification('success', message, true)
      logger.info('スケジュール成功通知を表示', { message })
    }

  } catch (error) {
    logger.error('スケジュール予約実行エラー', { scheduleId, error })
    
    scheduledReservationStore.updateScheduleExecutionResult(
      scheduleId,
      false,
      error instanceof Error ? error.message : String(error)
    )
  }
}

// 複製編集イベントハンドラ
const handleScheduleDuplicateEdit = async (event: Event) => {
  const customEvent = event as CustomEvent
  const { newScheduleId, originalTimeSlots, searchQuery } = customEvent.detail
  
  logger.info('複製編集イベント受信', { 
    newScheduleId, 
    searchQuery, 
    timeSlotsCount: originalTimeSlots.length 
  })
  
  try {
    // スケジュール設定行を表示
    if (!scheduledReservationStore.uiState.showScheduleRow) {
      scheduledReservationStore.toggleScheduleRow()
    }
    
    // 検索フィールドにパビリオン名を設定
    searchInput.value = searchQuery
    
    // 検索を実行
    await handlePavilionSearch()
    
    // 少し待ってから自動選択を実行
    setTimeout(() => {
      originalTimeSlots.forEach((originalSlot: any) => {
        // 現在の検索結果から同じパビリオンと時間帯を探して選択
        const matchingPavilion = filteredPavilions.value.find((p: any) => 
          p.name === originalSlot.pavilionName
        )
        
        if (matchingPavilion) {
          const matchingTimeSlot = matchingPavilion.timeSlots?.find((ts: any) => 
            ts.time === originalSlot.timeSlot
          )
          
          if (matchingTimeSlot) {
            handleScheduleTimeSlotClick(matchingPavilion.id, matchingTimeSlot)
            logger.debug('複製編集: 時間帯自動選択', {
              pavilionName: matchingPavilion.name,
              timeSlot: matchingTimeSlot.time
            })
          }
        }
      })
    }, 1000) // 1秒待機
    
  } catch (error) {
    logger.error('複製編集イベント処理エラー', error)
  }
}

// ライフサイクル
onMounted(() => {
  logger.info('PavilionTab mounted')
  // ストア初期化
  scheduledReservationStore.initialize()
  
  // スケジュールフォームの初期化
  resetScheduleForm()
  
  // CustomLoggerのイベントハンドラーを登録
  logEventHandler = (level, module, message, data) => {
    addLogMessage(level, module, message, data)
  }
  CustomLogger.addLogEventHandler(logEventHandler)
  
  // スケジュール関連イベントリスナーを登録
  window.addEventListener('schedule-execute-reservation', handleScheduleExecuteReservation as EventListener)
  window.addEventListener('schedule-duplicate-edit', handleScheduleDuplicateEdit as EventListener)
})

onUnmounted(() => {
  logger.info('PavilionTab unmounted')
  // イベントリスナーを削除
  window.removeEventListener('schedule-execute-reservation', handleScheduleExecuteReservation as EventListener)
  window.removeEventListener('schedule-duplicate-edit', handleScheduleDuplicateEdit as EventListener)
  
  // CustomLoggerのイベントハンドラーを除去
  if (logEventHandler) {
    CustomLogger.removeLogEventHandler(logEventHandler)
    logEventHandler = null
  }
})
</script>

<style scoped lang="scss">
/**
 * パビリオンタブのスタイル定義
 */

.ytomo-pavilion-tab {
    padding: 0 8px 20px 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    color-scheme: light;
}

/* 検索コントロールエリア */
.ytomo-search-controls {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
}

.ytomo-search-input-container {
    flex: 1;
}

.ytomo-search-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #2c5aa0;
    }

    &::placeholder {
        color: #9ca3af;
    }
}

.ytomo-control-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    @media (max-width: 600px) {
        justify-content: center;
    }
}

.ytomo-icon-button {
    width: 40px;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 16px;
    position: relative;

    &:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &.active {
        background: #2c5aa0;
        border-color: #2c5aa0;
        color: white;

        &:hover {
            background: #1a365d;
        }
    }
    
    /* カウントバッジ */
    .ytomo-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
        pointer-events: none;
        z-index: 10;
    }

    /* スケジュールボタン専用スタイル */
    .ytomo-schedule-button {
        position: relative;
        
        .ytomo-schedule-icon {
            transition: transform 0.3s ease;
        }
        
        .ytomo-count-badge {
            background: #00b894; /* スケジュール用は緑色 */
        }
        
        /* 実行中状態 */
        &.running {
            background: #e17055 !important;
            border-color: #e17055 !important;
            
            .ytomo-schedule-icon {
                animation: ytomo-schedule-spin 2s linear infinite;
            }
            
            .ytomo-count-badge {
                background: #fdcb6e;
                animation: ytomo-schedule-pulse 1.5s ease-in-out infinite;
            }
        }
    }

    /* スケジュール実行中アニメーション */
    @keyframes ytomo-schedule-spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes ytomo-schedule-pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }

    &:focus {
        outline: none;
    }

    span {
        display: block;
        line-height: 1;
    }
}

/* パビリオン一覧エリア */
.ytomo-pavilion-list {
    flex: 1;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.ytomo-pavilion-item {
    background: white;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
    color: #374151;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f8fafc;
    }

    &.hidden {
        display: none;
    }
}

.ytomo-pavilion-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    cursor: pointer;
}

.ytomo-star-button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 4px;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
        background: rgba(255, 193, 7, 0.1);
    }

    &.favorite {
        color: #ffc107;
    }

    &:focus {
        outline: none;
    }
}

.ytomo-official-link-button {
    background: none;
    border: 1px solid #cbd5e1;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 6px;
    border-radius: 4px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }

    &:focus {
        outline: none;
    }
}

.ytomo-pavilion-checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.ytomo-pavilion-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.ytomo-pavilion-name {
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    line-height: 1.4;
}

.ytomo-pavilion-status {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ytomo-status-available {
    background: #dcfce7;
    color: #166534;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.ytomo-status-full {
    background: #fef2f2;
    color: #991b1b;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.ytomo-expand-button {
    background: none;
    border: none;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background: #f3f4f6;
        color: #374151;
    }

    &.expanded {
        background: #e2e8f0;
        color: #374151;
    }

    &:focus {
        outline: none;
    }
}

/* 時間帯エリア */
.ytomo-time-slots {
    padding: 0 16px 16px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    transition: all 0.3s ease;

    &.hidden {
        display: none;
    }
}

.ytomo-time-slot-button {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    min-width: 70px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;

    /* 子要素のポインターイベントを無効化してボタン全体をクリック可能にする */
    * {
        pointer-events: none;
    }

    &.available {
        background: #dcfce7;
        border-color: #22c55e;
        color: #166534;

        &.limited {
            background: #fed7aa;  // オレンジ色（残りわずか）
            border-color: #f97316;
            color: #c2410c;
        }

        &:hover {
            background: #bbf7d0;  // 選択より薄い色
            color: #166534;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

            &.limited {
                background: #fdba74;  // オレンジのホバー色
                color: #c2410c;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
            }
        }

        &.selected {
            background: #22c55e;  // しっかりとした濃い色
            color: white;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

            &.limited {
                background: #f97316;  // オレンジの選択色
                color: white;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
            }
        }
    }

    &.unavailable {
        background: #fef2f2;
        border-color: #ef4444;
        color: #991b1b;
        cursor: pointer;
        opacity: 1;

        &:hover {
            background: #fecaca;  // hover時の色変化
            color: #991b1b;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        &.selected {
            background: #ef4444;  // 選択時の色変化
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
    }

    &.rate-limited {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #6b7280;
        cursor: not-allowed;
        opacity: 0.6;

        &:hover {
            background: #f3f4f6;
            color: #6b7280;
            transform: none;
            box-shadow: none;
        }

        &:disabled {
            cursor: not-allowed;
            pointer-events: none;
        }
    }

    &:focus {
        outline: none;  // focus囲みを削除
    }

    &:disabled {
        background: #f3f4f6;
        border-color: #d1d5db;
        color: #9ca3af;
        cursor: not-allowed;
        opacity: 0.6;
        pointer-events: none;
        
        &:hover {
            background: #f3f4f6;
            color: #9ca3af;
            transform: none;
            box-shadow: none;
        }
    }

    /* 実行状態は右上角で表示するため境界線変更は削除 */
    position: relative; /* 右上角表示のため */

    &.hidden {
        display: none;
    }
}

/* 実行状態表示用の右上角 */
.ytomo-execution-corner {
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 0 4px 0 0;

    &.status-executing {
        background: #3b82f6;
        animation: executionPulse 1.5s ease-in-out infinite;
    }

    &.status-success {
        background: #10b981;
    }

    &.status-failed {
        background: #ef4444;
    }
}

@keyframes executionPulse {
    0%, 100% {
        box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
    }
    50% {
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 予約コントロールエリア */
.ytomo-reservation-controls {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
}

.ytomo-selected-info {
    flex: 1;
    font-size: 14px;
    color: #374151;
    font-weight: 500;

    @media (max-width: 600px) {
        text-align: center;
    }
}

.ytomo-reservation-controls .ytomo-button {
    padding: 10px 20px;
    font-weight: 600;
    white-space: nowrap;

    @media (max-width: 600px) {
        width: 100%;
    }
}

/* Cookie設定ボタンを非表示 */
#ot-sdk-btn-floating {
    display: none !important;
}

/* 予約結果表示 */
.ytomo-result-display {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s;
    pointer-events: none;
    max-width: 300px;
    z-index: 10001;
    display: none;  /* デフォルト非表示 */
    
    &.ytomo-visible {
        display: block;
    }

    &.show {
        opacity: 1;
        transform: translateY(0);
    }

    &.success {
        background: #22c55e;
        color: white;
    }

    &.error {
        background: #ef4444;
        color: white;
    }

    &.info {
        background: #3b82f6;
        color: white;
    }

    @media (max-width: 600px) {
        position: static;
        transform: none;
        margin: 8px 0 0 0;
        text-align: center;
    }
}

/* 空の状態・エラー表示 */
.ytomo-pavilion-tab .ytomo-empty-state,
.ytomo-pavilion-tab .ytomo-error {
    padding: 40px 20px;
    text-align: center;
}

.ytomo-pavilion-tab .ytomo-empty-state p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
}

.ytomo-pavilion-tab .ytomo-error p {
    margin: 0;
    color: #dc2626;
    font-size: 14px;
}

/* ローディング表示の調整 */
.ytomo-pavilion-tab .ytomo-loading {
    height: 150px;
}

/* スクロールバーのスタイル */
.ytomo-pavilion-list::-webkit-scrollbar {
    width: 6px;
}

.ytomo-pavilion-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.ytomo-pavilion-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
        background: #94a3b8;
    }
}

/* 選択入場日表示エリア */
.ytomo-selected-dates-display {
    background: white;
    border-radius: 8px;
    padding: 10px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    min-height: 36px;
    display: flex;
    align-items: center;
}

.ytomo-selected-dates-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.ytomo-dates-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    flex-shrink: 0;
}

.ytomo-dates-text {
    font-size: 14px;
    color: #2c5aa0;
    font-weight: 500;
    
    &:empty::before {
        content: "なし";
        color: #9ca3af;
        font-style: italic;
    }
}

/* ステータスFAB（予約結果表示用） */
.ytomo-status-fab {
    position: fixed;
    bottom: 86px;  /* 予約FABの上に配置 */
    right: 20px;
    min-width: 120px;
    min-height: 50px;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 1001;  /* 予約FABより上 */
    display: none;  /* デフォルト非表示 */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px 12px;
    line-height: 1.2;
    
    &.ytomo-visible {
        display: flex;
    }
    
    /* 成功状態 */
    &.success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }
    
    /* エラー状態 */
    &.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
    
    /* 情報状態 */
    &.info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:focus {
        outline: none;
    }
}

/* 予約情報エリア */
.ytomo-reservation-info-panel {
    position: fixed;
    bottom: 150px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 2px solid #2c5aa0;
    z-index: 1000;
    transition: all 0.3s ease;

    /* ステータス別背景色 */
    &.status-executing {
        background: #eff6ff; /* 薄い青 */
        border-color: #3b82f6;
    }

    &.status-success {
        background: #f0fdf4; /* 薄い緑 */
        border-color: #10b981;
    }

    &.status-failed {
        background: #fef2f2; /* 薄い赤 */
        border-color: #ef4444;
    }

    &.status-waiting {
        background: #fffbeb; /* 薄い黄 */
        border-color: #f59e0b;
    }

    &.status-stopped {
        background: #f9fafb; /* 薄いグレー */
        border-color: #6b7280;
    }

    &.collapsed {
        width: 56px;
        height: 56px;
    }
}

.ytomo-info-collapsed {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 10px;
    background: inherit; /* 親の背景色を継承 */
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }

    .ytomo-collapsed-icon {
        font-size: 24px;
        background: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
}

.ytomo-info-expanded {
    width: 240px;
    padding: 16px;
}

.ytomo-info-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 8px;
}

.ytomo-endless-button {
    background: none;
    border: 2px solid #d1d5db;
    border-radius: 6px;
    width: 32px;
    height: 32px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &.active {
        background: #2c5aa0;
        border-color: #2c5aa0;
        color: white;
    }

    &:hover {
        border-color: #9ca3af;
    }
}

.ytomo-mode-selector {
    padding: 4px 8px;
    font-size: 11px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    color: #374151;
    cursor: pointer;
    min-width: 60px;
    height: 32px;
    display: flex;
    align-items: center;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }

    option {
        padding: 4px;
    }
}

.ytomo-collapse-button {
    background: none;
    border: none;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    height: 32px;

    &:hover {
        background: #f3f4f6;
    }
}

// 予約履歴リスト
.ytomo-reservation-history-list {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ytomo-history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #374151;
    padding: 4px 8px;
    border-radius: 4px;
    background: #f9fafb;
    transition: background 0.2s;

    &.item-running {
        background: #dbeafe;
        border: 1px solid #3b82f6;
    }
}

.ytomo-current-time {
    font-size: 11px;
    font-weight: 600;
    color: #2c5aa0;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 50px;
}

.ytomo-pavilion-name-truncated {
    flex: 1;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ytomo-progress {
    font-weight: 600;
}

.ytomo-status {
    font-weight: 500;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;

    &.status-running {
        color: #3b82f6;
    }

    &.status-succeeded {
        color: #10b981;
    }

    &.status-failed {
        color: #ef4444;
    }

    &.status-waiting {
        color: #f59e0b;
    }

    // 旧形式のサポート（後方互換性）
    &:has-text("Running") {
        color: #3b82f6;
    }

    &:has-text("Executing") {
        color: #3b82f6;
    }

    &:has-text("Failed") {
        color: #ef4444;
    }

    &:has-text("Succeeded") {
        color: #10b981;
    }

    &:has-text("Waiting") {
        color: #f59e0b;
    }

    &:has-text("Stopped") {
        color: #6b7280;
    }
}

/* 予約実行FABボタン */
.ytomo-reservation-fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
    border: none;
    border-radius: 28px;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(44, 90, 160, 0.3);
    transition: all 0.3s ease;
    z-index: 10003;
    display: flex;
    align-items: center;
    justify-content: center;

    .ytomo-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
        pointer-events: none;
        z-index: 10;
    }

    .ytomo-reservation-warning-badge {
        position: absolute;
        top: -8px;
        left: -8px;
        background: #f59e0b;
        color: white;
        border-radius: 8px;
        padding: 2px 6px;
        font-size: 9px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        z-index: 10;
        animation: pulse 2s ease-in-out infinite;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(44, 90, 160, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
    }

    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        box-shadow: 0 2px 8px rgba(148, 163, 184, 0.3);
        opacity: 0.8;
        display: flex; /* 無効時でも表示を維持 */
    }

    &:focus {
        outline: none;
    }

    &.abort-mode {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        font-size: 14px;
        font-weight: bold;

        &:hover:not(:disabled) {
            background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
        }
    }
}


/* 選択解除ボタン */

/* ボタン間の縦線セパレータ */
.ytomo-button-separator {
    width: 1px;
    height: 32px;
    background: #d1d5db;
    margin: 0 6px;
    align-self: center;
}

/* スケジュール設定行 */
.ytomo-schedule-controls {
    background: white;
    border-radius: 6px;
    padding: 10px 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    flex-shrink: 0;
}

.ytomo-schedule-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.ytomo-form-row {
    display: flex;
    align-items: end;
    gap: 10px;
    flex-wrap: nowrap;
    overflow: visible;

    // 狭い画面でのみ改行を許可
    @media (max-width: 800px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    &.ytomo-header-row {
        display: block;
        white-space: nowrap;

        > * {
            display: inline-block;
            vertical-align: bottom;
            margin-right: 16px;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    &.ytomo-main-row {
        display: block;
        white-space: nowrap;

        .ytomo-form-group {
            display: inline-block;
            vertical-align: bottom;
            margin-right: 12px;
            white-space: nowrap;

            &:last-child {
                margin-right: 0;
            }
        }

        // 狭い画面でもスケジュール設定は1行維持
        // @media設定を削除 - 常に横並び表示
    }
}

.ytomo-form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 0 0 auto;

    // 時間入力は横幅を狭く
    &:has(.ytomo-time-input) {
        min-width: 80px;
    }

    // 数値入力の横幅を削減
    &:has(.ytomo-number-input) {
        min-width: 60px;
    }

    // 状態ボタンの横幅を大幅削減
    &:has(.ytomo-toggle-button) {
        min-width: 50px;
    }

    // テキスト入力の横幅を削減
    &:has(.ytomo-text-input) {
        min-width: 120px;
    }

    // 間隔と回数を隣り合わせに配置
    &.ytomo-interval-retries-group {
        display: inline-block;
        white-space: nowrap;

        .ytomo-interval-input,
        .ytomo-retries-input {
            display: inline-block;
            vertical-align: top;
            margin-right: 8px;
            width: 60px;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    &:last-of-type {
        margin-left: auto;

        @media (max-width: 800px) {
            margin-left: 0;
        }
    }
}

// 入力欄内部ラベル
.ytomo-input-with-label {
    position: relative;
    display: inline-block;

    .ytomo-input-label {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 9px;
        font-weight: 600;
        color: #6b7280;
        background: white;
        padding: 0 2px;
        z-index: 1;
        pointer-events: none;
    }

    .ytomo-form-input {
        padding-top: 16px;
        padding-bottom: 4px;
    }

}

// 廃止予定の外部ラベル
.ytomo-form-label {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 2px;
}

.ytomo-form-input {
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #2c5aa0;
    }

    &.ytomo-date-input {
        width: 140px;
    }

    &.ytomo-time-input {
        width: 80px;
    }

    &.ytomo-number-input {
        width: 60px;
    }

    &.ytomo-text-input {
        width: 120px;
    }
}

.ytomo-datetime-inputs {
    display: flex;
    gap: 6px;
}

.ytomo-toggle-button {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    color: #374151;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: 50px;

    &.active {
        background: #22c55e;
        border-color: #22c55e;
        color: white;
    }

    &:hover {
        border-color: #9ca3af;
    }

    &:focus {
        outline: none;
        border-color: #2c5aa0;
    }
}

.ytomo-form-actions {
    display: inline-block;

    .ytomo-action-button {
        margin-right: 16px;

        &:last-child {
            margin-right: 0;
        }
    }
}

.ytomo-action-button {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;

    &:focus {
        outline: none;
    }

    &.ytomo-save-button {
        background: #2c5aa0;
        border-color: #2c5aa0;
        color: white;

        &:hover:not(:disabled) {
            background: #1a365d;
            border-color: #1a365d;
        }

        &:disabled {
            background: #94a3b8;
            border-color: #94a3b8;
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    &.ytomo-dialog-button {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;

        &:hover {
            background: #2563eb;
            border-color: #2563eb;
        }
    }
}

.ytomo-selected-timeslots-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
    font-size: 12px;
}

.ytomo-info-label {
    color: #6b7280;
    font-weight: 500;
}

.ytomo-info-count {
    color: #2c5aa0;
    font-weight: 600;
}

.ytomo-selected-slots-preview {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.ytomo-slot-preview {
    background: #f3f4f6;
    color: #374151;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.ytomo-more-slots {
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
}

/* スケジュール選択状態 */
.ytomo-time-slot-button {
    &.schedule-selected {
        background: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;

        &:hover {
            background: #2563eb !important;
            border-color: #2563eb !important;
        }
    }
}

/* アニメーション */
.ytomo-pavilion-item {
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ホバー効果の強化 */
.ytomo-time-slot-button.available:hover {
    animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
    0% { transform: translateY(-1px); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(-1px); }
}

/* フォーカス状態の統一 */
.ytomo-pavilion-tab input:focus {
    outline: none;
    border-color: #2c5aa0;
}

.ytomo-pavilion-tab button:focus {
    outline: none;
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-pavilion-item,
    .ytomo-time-slot-button,
    .ytomo-icon-button,
    .ytomo-result-display,
    .ytomo-time-slots {
        animation: none;
        transition: none;
    }

    .ytomo-time-slot-button.available:hover {
        animation: none;
        transform: none;
    }
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
    .ytomo-pavilion-item {
        border-bottom-width: 2px;
    }

    .ytomo-time-slot-button {
        border-width: 2px;
    }

    .ytomo-icon-button.active {
        border-width: 3px;
    }

    .ytomo-pavilion-tab input:focus,
    .ytomo-pavilion-tab button:focus {
        outline: 3px solid #000;
    }
}

/* 誤操作防止オーバーレイ */
.ytomo-processing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001; /* メインダイアログより高いが、全画面ブロックは避ける */
    opacity: 0;
    animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-processing-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 300px;
    transform: scale(0.9);
    animation: dialogAppear 0.2s ease-out forwards;
}

.ytomo-processing-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

.ytomo-processing-message {
    margin: 0 0 24px;
    color: #374151;
    font-size: 16px;
    font-weight: 500;
}

.ytomo-cancel-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background: #4b5563;
    }

    &:focus {
        outline: 2px solid #2c5aa0;
        outline-offset: 2px;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

/* 予約結果FAB（予約FABの左側に配置） */
.ytomo-reservation-result-fab {
    position: fixed;
    bottom: 80px;  /* 予約FABと同じ高さ */
    right: 84px;   /* 予約FABの左側に配置 (20px + 56px + 8px = 84px) */
    min-width: 120px;
    min-height: 50px;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 10003;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px 12px;
    line-height: 1.2;
    
    &.success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }

    &.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    &.fab-blue {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    &.fab-green {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }

    &.fab-red {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    &.fab-yellow {
        background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
        box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
    }
    
    .ytomo-result-status {
        font-weight: 600;
        font-size: 11px;
        margin-bottom: 2px;

        .ytomo-failure-reason {
            font-size: 9px;
            font-weight: 500;
            opacity: 0.9;
        }
    }
    
    .ytomo-result-pavilion {
        font-size: 12px;
        opacity: 0.95;
        margin-bottom: 2px;
        font-weight: 500;
    }
    
    .ytomo-result-time {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 600;
    }
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:focus {
        outline: none;
    }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-processing-overlay,
    .ytomo-processing-content,
    .ytomo-processing-spinner {
        animation: none;
        transition: none;
    }
    
}

/* ログFAB関連スタイル */
.ytomo-log-fab-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 10002;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    pointer-events: auto;
}

.ytomo-log-fab {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
    }
    
    &.expanded {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
    
    &.has-logs {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    
    .ytomo-log-icon {
        font-size: 20px;
    }
    
    .ytomo-log-count {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
    }
}

.ytomo-log-display {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    width: 400px;
    max-height: 300px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &.large-size {
        width: 600px;
        max-height: 500px;
        
        .ytomo-log-messages {
            max-height: 420px;
            
            @media (max-width: 480px) {
                max-height: 380px;
            }
        }
        
        @media (max-width: 640px) {
            width: 90vw;
            max-height: 70vh;
        }
    }
    
    @media (max-width: 480px) {
        width: 320px;
        max-height: 250px;
    }
}

.ytomo-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: bold;
    font-size: 14px;
    flex-wrap: wrap;
    gap: 8px;
    
    .ytomo-log-controls {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    
    .ytomo-log-filter {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 11px;
        cursor: pointer;
        
        option {
            background: #1f2937;
            color: white;
        }
    }
    
    .ytomo-log-btn {
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        min-width: 24px;
        
        &:hover {
            background: #4f46e5;
        }
        
        &:last-child {
            background: #ef4444;
            
            &:hover {
                background: #dc2626;
            }
        }
    }
}

.ytomo-log-messages {
    max-height: 220px;
    overflow-y: auto;
    padding: 8px;
    
    @media (max-width: 480px) {
        max-height: 180px;
    }
}

.ytomo-log-message {
    margin-bottom: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    border-left: 3px solid transparent;
    
    &.log-temp {
        background: rgba(168, 85, 247, 0.2);
        border-left-color: #a855f7;
    }
    
    &.log-error {
        background: rgba(239, 68, 68, 0.2);
        border-left-color: #ef4444;
    }
    
    &.log-warn {
        background: rgba(245, 158, 11, 0.2);
        border-left-color: #f59e0b;
    }
    
    &.log-info {
        background: rgba(59, 130, 246, 0.2);
        border-left-color: #3b82f6;
    }
    
    &.log-debug {
        background: rgba(107, 114, 128, 0.2);
        border-left-color: #6b7280;
    }
    
    .ytomo-log-time {
        color: #9ca3af;
        font-size: 10px;
        margin-right: 6px;
    }
    
    .ytomo-log-level {
        font-weight: bold;
        margin-right: 6px;
        font-size: 10px;
    }
    
    .ytomo-log-module {
        color: #60a5fa;
        margin-right: 6px;
        font-size: 10px;
    }
    
    .ytomo-log-text {
        color: white;
    }
    
    .ytomo-log-data {
        margin-top: 4px;
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 6px;
        border-radius: 3px;
        font-size: 10px;
        color: #d1d5db;
        white-space: pre-wrap;
        overflow-x: auto;
    }
}

.ytomo-log-empty {
    text-align: center;
    color: #9ca3af;
    padding: 20px;
    font-style: italic;
}

/* スクロールバースタイル */
.ytomo-log-messages::-webkit-scrollbar {
    width: 6px;
}

.ytomo-log-messages::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.ytomo-log-messages::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.ytomo-log-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
</style>