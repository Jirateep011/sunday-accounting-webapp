<template>
  <div class="multiple-transaction-form">
    <div class="form-header">
      <h2 class="text-center">เพิ่มรายการหลายรายการพร้อมกัน</h2>
      <p class="subtitle">เพิ่มรายการรายรับหรือรายจ่ายหลายรายการในครั้งเดียว</p>
    </div>

    <!-- Transaction Type Selection -->
    <div class="mb-4">
      <label class="form-label">
        <i class="fa-solid fa-tag me-2"></i>
        ประเภทของรายการ
      </label>
      <select v-model="transactionType" class="form-select" @change="onTransactionTypeChange">
        <option value="" disabled>เลือกประเภท</option>
        <option value="income">รายรับ</option>
        <option value="expense">รายจ่าย</option>
      </select>
    </div>

    <!-- Transaction Items -->
    <div v-if="transactionType" class="transaction-items">
      <div class="items-header">
        <h4>
          <i class="fa-solid fa-list me-2"></i>
          รายการ{{ transactionType === 'income' ? 'รายรับ' : 'รายจ่าย' }} 
          ({{ transactions.length }} รายการ)
        </h4>
        <button 
          type="button" 
          class="btn btn-outline-primary btn-sm"
          @click="addTransaction"
        >
          <i class="fa-solid fa-plus me-2"></i>
          เพิ่มรายการ
        </button>
      </div>

      <div class="transactions-container">
        <div 
          v-for="(transaction, index) in transactions" 
          :key="transaction.id"
          class="transaction-item"
          :class="{ 'has-error': hasError(index) }"
        >
          <div class="item-header">
            <span class="item-number">{{ index + 1 }}</span>
            <button 
              type="button" 
              class="btn btn-outline-danger btn-sm delete-btn"
              @click="removeTransaction(index)"
              :disabled="transactions.length === 1"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <div class="row g-3">
            <!-- Date -->
            <div class="col-md-6">
              <label class="form-label">
                <i class="fa-solid fa-calendar-days me-2"></i>
                วันที่
              </label>
              <input 
                type="date" 
                v-model="transaction.date" 
                class="form-control"
                :max="maxDate"
                required
              />
            </div>

            <!-- Pocket -->
            <div class="col-md-6">
              <label class="form-label">
                <i class="fa-solid fa-layer-group me-2"></i>
                หมวดหมู่
              </label>
              <select v-model="transaction.pocketId" class="form-select" required>
                <option value="" disabled>เลือกหมวดหมู่</option>
                <template v-if="transactionType === 'income'">
                  <option v-for="pocket in incomePockets" :key="pocket._id" :value="pocket._id">
                    {{ pocket.name }}
                  </option>
                </template>
                <template v-else>
                  <option v-for="pocket in expensePockets" :key="pocket._id" :value="pocket._id">
                    {{ pocket.name }}
                  </option>
                </template>
              </select>
            </div>

            <!-- Amount -->
            <div class="col-md-6">
              <label class="form-label">
                <i class="fa-solid fa-coins me-2"></i>
                จำนวนเงิน
              </label>
              <input 
                type="number" 
                v-model="transaction.amount" 
                class="form-control" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <!-- Description -->
            <div class="col-md-6">
              <label class="form-label">
                <i class="fa-solid fa-note-sticky me-2"></i>
                บันทึกช่วยจำ
              </label>
              <input 
                type="text" 
                v-model="transaction.description" 
                class="form-control" 
                placeholder="รายละเอียดของรายการ"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="transactionType && transactions.length > 0" class="summary-section">
      <div class="summary-card">
        <h5>
          <i class="fa-solid fa-calculator me-2"></i>
          สรุปรายการ
        </h5>
        <div class="summary-details">
          <div class="summary-item">
            <span class="label">จำนวนรายการ:</span>
            <span class="value">{{ validTransactions.length }} รายการ</span>
          </div>
          <div class="summary-item">
            <span class="label">รวมเป็นเงิน:</span>
            <span class="value total-amount">
              {{ formatCurrency(totalAmount) }} บาท
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="transactionType" class="action-buttons">
      <button 
        type="button" 
        class="btn btn-primary"
        @click="submitTransactions"
        :disabled="!canSubmit"
      >
        <i class="fa-solid fa-save me-2"></i>
        บันทึกทั้งหมด ({{ validTransactions.length }} รายการ)
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
        <i class="fa-solid fa-times me-2"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  props: {
    selectedDate: {
      type: Date,
      required: true
    }
  },
  emits: ['transactions-added', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    
    // Reactive data
    const transactionType = ref('')
    const transactions = ref([])
    const maxDate = new Date().toISOString().split('T')[0]

    // Computed properties
    const incomePockets = computed(() => store.getters.incomePockets)
    const expensePockets = computed(() => store.getters.expensePockets)

    const validTransactions = computed(() => {
      return transactions.value.filter(t => 
        t.date && t.pocketId && t.amount && t.description && 
        parseFloat(t.amount) > 0
      )
    })

    const totalAmount = computed(() => {
      return validTransactions.value.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    })

    const canSubmit = computed(() => {
      return transactionType.value && validTransactions.value.length > 0
    })

    // Methods
    const formatDateForInput = (date) => {
      if (!date) return new Date().toISOString().split('T')[0]
      const d = new Date(date)
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
      return d.toISOString().split('T')[0]
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }

    const createEmptyTransaction = () => ({
      id: Date.now() + Math.random(),
      date: formatDateForInput(props.selectedDate),
      pocketId: '',
      amount: null,
      description: ''
    })

    const addTransaction = () => {
      transactions.value.push(createEmptyTransaction())
    }

    const removeTransaction = (index) => {
      if (transactions.value.length > 1) {
        transactions.value.splice(index, 1)
      }
    }

    const onTransactionTypeChange = () => {
      // Reset transactions when type changes
      transactions.value = [createEmptyTransaction()]
    }

    const hasError = (index) => {
      const transaction = transactions.value[index]
      return !transaction.date || !transaction.pocketId || 
             !transaction.amount || !transaction.description ||
             parseFloat(transaction.amount || 0) <= 0
    }

    const submitTransactions = async () => {
      try {
        if (!canSubmit.value) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วนในทุกรายการ')
        }

        const result = await Swal.fire({
          title: 'ยืนยันการบันทึก',
          text: `คุณต้องการบันทึก${transactionType.value === 'income' ? 'รายรับ' : 'รายจ่าย'} ${validTransactions.value.length} รายการ หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#6c5ce7',
          cancelButtonColor: '#74b9ff'
        })

        if (!result.isConfirmed) return

        // Prepare data
        const transactionsData = validTransactions.value.map(transaction => ({
          date: new Date(transaction.date).toISOString(),
          pocketId: transaction.pocketId,
          amount: parseFloat(transaction.amount),
          description: transaction.description,
          type: transactionType.value
        }))

        // Submit to store
        if (transactionType.value === 'income') {
          await store.dispatch('createMultipleIncome', transactionsData)
        } else {
          await store.dispatch('createMultipleExpenses', transactionsData)
        }

        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `เพิ่ม${transactionType.value === 'income' ? 'รายรับ' : 'รายจ่าย'} ${validTransactions.value.length} รายการ เรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7',
          timer: 2000,
          timerProgressBar: true
        })

        // Emit success event
        emit('transactions-added', transactionsData)
        
        // Reset form
        resetForm()

      } catch (error) {
        console.error('Error submitting multiple transactions:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7'
        })
      }
    }

    const resetForm = () => {
      transactionType.value = ''
      transactions.value = []
    }

    const loadPockets = async () => {
      try {
        await store.dispatch('fetchPockets')
      } catch (error) {
        console.error('Error loading pockets:', error)
      }
    }

    // Watchers
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        const formattedDate = formatDateForInput(newDate)
        transactions.value.forEach(transaction => {
          if (!transaction.date) {
            transaction.date = formattedDate
          }
        })
      }
    })

    // Lifecycle
    onMounted(() => {
      loadPockets()
      // Initialize with one empty transaction
      if (transactions.value.length === 0) {
        addTransaction()
      }
    })

    return {
      // Data
      transactionType,
      transactions,
      maxDate,
      
      // Computed
      incomePockets,
      expensePockets,
      validTransactions,
      totalAmount,
      canSubmit,
      
      // Methods
      formatCurrency,
      addTransaction,
      removeTransaction,
      onTransactionTypeChange,
      hasError,
      submitTransactions,
      resetForm
    }
  }
}
</script>

<style scoped>
.multiple-transaction-form {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  max-height: 80vh;
  overflow-y: auto;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h2 {
  color: var(--text-color);
  font-weight: 700;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 0.95rem;
  margin: 0;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.form-label i {
  color: var(--primary-color);
}

.form-select,
.form-control {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-select:focus,
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  background: white;
  transform: translateY(-1px);
}

.transaction-items {
  margin-bottom: 2rem;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.items-header h4 {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.items-header h4 i {
  color: var(--primary-color);
}

.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.transaction-item {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
}

.transaction-item.has-error {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.item-number {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.delete-btn {
  border-radius: 8px;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-card h5 {
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.summary-card h5 i {
  color: #0ea5e9;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  font-weight: 500;
  color: var(--text-color);
}

.summary-item .value {
  font-weight: 600;
  color: var(--text-color);
}

.total-amount {
  font-size: 1.1rem;
  color: var(--primary-color) !important;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  border: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
}

.btn-primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.btn-outline-secondary {
  border-radius: 12px;
  padding: 1rem 2rem;
  border: 2px solid #e1e5e9;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary {
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: var(--primary-color);
  color: white;
}

.btn-outline-danger {
  border: 2px solid #ff6b6b;
  color: #ff6b6b;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background: #ff6b6b;
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .multiple-transaction-form {
    padding: 1rem;
    border-radius: 12px;
  }

  .items-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .items-header h4 {
    font-size: 1rem;
  }

  .transaction-item {
    padding: 1rem;
  }

  .summary-details {
    gap: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-outline-secondary {
    padding: 0.875rem 1.5rem;
  }
}

/* CSS Variables */
:root {
  --primary-color: #6366f1;
  --text-color: #1a202c;
  --text-light: #718096;
}
</style>
