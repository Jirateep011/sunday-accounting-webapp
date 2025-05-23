<template>
  <div class="cloud-pocket container-fluid">
    <!-- Page Header -->
    <div class="section-header mb-4">
      <h2 class="mb-0">หมวดหมู่รายรับ-รายจ่าย</h2>
    </div>

    <div class="row g-4">
      <!-- Income Categories -->
      <div class="col-12 col-lg-6">
        <div class="pocket-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">
              <i class="bi bi-graph-up-arrow text-success me-2"></i>
              รายรับ
            </h3>
            <button class="btn btn-outline-success btn-sm" @click="showAddPocketModal('income')">
              <i class="bi bi-plus-lg"></i>
              เพิ่มหมวดหมู่
            </button>
          </div>
          <div class="pockets-container row g-3">
            <div v-for="pocket in incomePockets" :key="pocket.id" class="col-12 col-sm-6">
              <div :class="['pocket-card income', { 'selected': selectedPocket?.id === pocket.id }]"
                @click="selectPocket(pocket)">
                <div class="pocket-icon">
                  <i :class="pocket.icon"></i>
                </div>
                <div class="pocket-info">
                  <h4>{{ pocket.name }}</h4>
                  <p class="amount">
                    <span class="text-muted">ยอดรวม:</span>
                    <span class="ms-1">{{ calculatePocketTotal(pocket.id, 'income').toLocaleString() }} ฿</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Categories -->
      <div class="col-12 col-lg-6">
        <div class="pocket-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">
              <i class="bi bi-graph-down-arrow text-danger me-2"></i>
              รายจ่าย
            </h3>
            <button class="btn btn-outline-danger btn-sm" @click="showAddPocketModal('expense')">
              <i class="bi bi-plus-lg"></i>
              เพิ่มหมวดหมู่
            </button>
          </div>
          <div class="pockets-container row g-3">
            <div v-for="pocket in expensePockets" :key="pocket.id" class="col-12 col-sm-6">
              <div :class="['pocket-card expense', { 'selected': selectedPocket?.id === pocket.id }]"
                @click="selectPocket(pocket)">
                <div class="pocket-icon">
                  <i :class="pocket.icon"></i>
                </div>
                <div class="pocket-info">
                  <h4>{{ pocket.name }}</h4>
                  <p class="amount">
                    <span class="text-muted">ยอดรวม:</span>
                    <span class="ms-1">{{ calculatePocketTotal(pocket.id, 'expense').toLocaleString() }} ฿</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Section -->
    <div class="row mt-4" v-if="selectedPocket">
      <div class="col-12">
        <div class="transaction-section">
          <div class="section-header">
            <div class="d-flex align-items-center gap-2">
              <div class="selected-pocket-icon">
                <i :class="selectedPocket.icon"></i>
              </div>
              <h3 class="mb-0">{{ selectedPocket.name }}</h3>
            </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button class="btn btn-primary btn-sm" @click="showAddForm = !showAddForm">
                <i :class="showAddForm ? 'bi bi-x-lg' : 'bi bi-plus-lg'"></i>
                {{ showAddForm ? 'ปิดฟอร์ม' : 'เพิ่มรายการ' }}
              </button>
            </div>
          </div>

          <!-- Add Transaction Form -->
          <div v-if="showAddForm" class="add-form-section my-4">
            <transaction-form :selected-pocket="selectedPocket" @transaction-added="handleTransaction" />
          </div>

          <!-- Transactions List -->
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>รายละเอียด</th>
                  <th class="text-end">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in pocketTransactions" :key="transaction.id">
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>{{ transaction.description }}</td>
                  <td :class="[
                    'text-end',
                    transaction.type === 'income' ? 'text-success' : 'text-danger'
                  ]">
                    {{ transaction.type === 'income' ? '+' : '-' }}
                    {{ transaction.amount.toLocaleString() }} ฿
                  </td>
                </tr>
                <tr v-if="pocketTransactions.length === 0">
                  <td colspan="3" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-6 d-block mb-2"></i>
                    ไม่พบรายการ
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="pocketTransactions.length > 0">
                <tr>
                  <td colspan="2" class="text-end fw-bold">ยอดรวม:</td>
                  <td :class="[
                    'text-end fw-bold',
                    pocketTotal >= 0 ? 'text-success' : 'text-danger'
                  ]">
                    {{ pocketTotal.toLocaleString() }} ฿
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">
            เพิ่มหมวดหมู่{{ newPocketType === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </h3>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <form @submit.prevent="addNewPocket">
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">ชื่อหมวดหมู่</label>
              <input v-model="newPocket.name" type="text" class="form-control" required placeholder="ระบุชื่อหมวดหมู่">
            </div>
            <div class="form-group">
              <label class="form-label">เลือกไอคอน</label>
              <div class="icon-grid">
                <div v-for="icon in availableIcons" :key="icon.value"
                  :class="['icon-option', { selected: newPocket.icon === icon.value }]"
                  @click="newPocket.icon = icon.value">
                  <i :class="icon.value"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">
              ยกเลิก
            </button>
            <button type="submit" class="btn" :class="newPocketType === 'income' ? 'btn-success' : 'btn-danger'">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import TransactionForm from './shared/TransactionForm.vue'

export default {
  name: 'CloudPocket',
  components: {
    TransactionForm
  },
  setup() {
    const store = useStore()
    const selectedPocket = ref(null)
    const showModal = ref(false)
    const newPocketType = ref('income')
    const newPocket = ref({
      name: '',
      icon: 'bi bi-wallet'
    })
    const showAddForm = ref(false)

    // ใช้ computed properties เพื่อดึงข้อมูลจาก store
    const incomePockets = computed(() => store.getters.getIncomePockets)
    const expensePockets = computed(() => store.getters.getExpensePockets)

    const selectPocket = (pocket) => {
      selectedPocket.value = pocket
    }

    const showAddPocketModal = (type) => {
      newPocketType.value = type
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      newPocket.value = {
        name: '',
        icon: 'bi bi-wallet'
      }
    }

    const addNewPocket = () => {
      const pocket = {
        id: Date.now(),
        name: newPocket.value.name,
        icon: newPocket.value.icon
      }

      if (newPocketType.value === 'income') {
        store.dispatch('addIncomePocket', pocket)
      } else {
        store.dispatch('addExpensePocket', pocket)
      }

      closeModal()
    }

    const calculatePocketTotal = (pocketId, type) => {
      const transactions = type === 'income' ? store.state.income : store.state.expenses
      return transactions
        .filter(t => t.pocketId === pocketId)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    const handleTransaction = (transaction) => {
      if (!selectedPocket.value) return

      const newTransaction = {
        ...transaction,
        id: Date.now(),
        date: new Date().toISOString(),
        pocketId: selectedPocket.value.id
      }

      if (transaction.type === 'income') {
        store.dispatch('addIncome', newTransaction)
      } else {
        store.dispatch('addExpense', newTransaction)
      }
    }

    const pocketTransactions = computed(() => {
      if (!selectedPocket.value) return []

      const incomeTransactions = store.state.income
        .filter(t => t.pocketId === selectedPocket.value.id)
        .map(t => ({ ...t, type: 'income' }))

      const expenseTransactions = store.state.expenses
        .filter(t => t.pocketId === selectedPocket.value.id)
        .map(t => ({ ...t, type: 'expense' }))

      return [...incomeTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const pocketTotal = computed(() => {
      return pocketTransactions.value.reduce((total, t) => {
        return total + (t.type === 'income' ? 1 : -1) * Number(t.amount)
      }, 0)
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH')
    }

    // เพิ่มรายการไอคอนที่มีให้เลือก
    const availableIcons = [
      { value: 'bi bi-wallet' },
      { value: 'bi bi-cart' },
      { value: 'bi bi-house' },
      { value: 'bi bi-controller' },
      { value: 'bi bi-briefcase' },
      { value: 'bi bi-rss' },
      { value: 'bi bi-bank' },
      { value: 'bi bi-gift' },
      { value: 'bi bi-cash-coin' },
      { value: 'bi bi-shop' },
      { value: 'bi bi-spotify' },
      { value: 'bi bi-book' },
      { value: 'bi bi-steam' },
      { value: 'bi bi-wifi' },
      { value: 'bi bi-globe' },
      { value: 'bi bi-joystick' },
    ]

    return {
      incomePockets,
      expensePockets,
      selectedPocket,
      showModal,
      newPocket,
      selectPocket,
      showAddPocketModal,
      closeModal,
      addNewPocket,
      calculatePocketTotal,
      handleTransaction,
      showAddForm,
      pocketTransactions,
      pocketTotal,
      formatDate,
      availableIcons
    }
  }
}
</script>

<style scoped>
.cloud-pocket {
  padding: 2rem;
}

.section-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pocket-section {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pocket-card {
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #eee;
}

.pocket-card.income {
  background: #f0fff4;
}

.pocket-card.expense {
  background: #fff5f5;
}

.pocket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pocket-card.selected.income {
  background: var(--success-color);
  color: white;
}

.pocket-card.selected.expense {
  background: var(--danger-color);
  color: white;
}

.pocket-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: white;
  flex-shrink: 0;
}

.selected .pocket-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.pocket-info {
  flex: 1;
  min-width: 0;
}

.pocket-info h4 {
  margin: 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.amount {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.selected-pocket-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.75rem;
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: var(--primary-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  transform: scale(1.05);
}

.icon-option.selected {
  background: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .cloud-pocket {
    padding: 1rem;
  }

  .section-header,
  .pocket-section {
    padding: 1rem;
  }

  .pocket-card {
    padding: 0.75rem;
  }

  .pocket-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 0.5rem;
  }
}

/* Animation */
.modal-overlay {
  animation: fadeIn 0.2s ease;
}

.modal-content {
  animation: slideIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>