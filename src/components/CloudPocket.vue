<template>
  <div class="cloud-pocket container-fluid">
    <!-- Page Header -->
    <div class="section-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="mb-0">หมวดหมู่รายรับ-รายจ่าย</h2>
        <div class="actions">
          <button class="btn btn-danger btn-sm me-2" 
                  :disabled="!selectedPockets.length"
                  @click="deleteSelectedPockets">
            <i class="bi bi-trash me-1"></i>
            ลบที่เลือก ({{ selectedPockets.length }})
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="toggleSelectMode">
            <i class="bi" :class="isSelectMode ? 'bi-x-lg' : 'bi-check-square'"></i>
            {{ isSelectMode ? 'ยกเลิก' : 'เลือกหลายรายการ' }}
          </button>
        </div>
      </div>
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
          <div class="pockets-container">
            <div v-for="pocket in incomePockets" :key="pocket.id" class="pocket-card income">
              <div class="pocket-content" @click="selectPocket(pocket)">
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
              <div class="pocket-actions" v-if="!isSelectMode">
                <button class="btn btn-link btn-sm" @click.stop="editPocket({...pocket, type: 'income'})">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-link btn-sm text-danger" @click.stop="deletePocket({...pocket, type: 'income'})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="pocket-checkbox" v-else>
                <input type="checkbox" 
                       class="form-check-input" 
                       :checked="isPocketSelected(pocket.id)"
                       @click.stop="togglePocketSelection(pocket.id)">
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
          <div class="pockets-container">
            <div v-for="pocket in expensePockets" :key="pocket.id" class="pocket-card expense">
              <div class="pocket-content" @click="handlePocketClick(pocket)">
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
              <div class="pocket-actions" v-if="!isSelectMode">
                <button class="btn btn-link btn-sm" @click.stop="editPocket({...pocket, type: 'expense'})">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-link btn-sm text-danger" @click.stop="deletePocket({...pocket, type: 'expense'})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="pocket-checkbox" v-else>
                <input type="checkbox" 
                       class="form-check-input" 
                       :checked="isPocketSelected(pocket.id)"
                       @click.stop="togglePocketSelection(pocket.id, 'expense')">
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
          <div class="section-header mb-4">
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

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">แก้ไขหมวดหมู่</h3>
          <button type="button" class="btn-close" @click="closeEditModal"></button>
        </div>
        <form @submit.prevent="updatePocket">
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">ชื่อหมวดหมู่</label>
              <input v-model="editingPocket.name" type="text" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">เลือกไอคอน</label>
              <div class="icon-grid">
                <div v-for="icon in availableIcons" :key="icon.value"
                  :class="['icon-option', { selected: editingPocket.icon === icon.value }]"
                  @click="editingPocket.icon = icon.value">
                  <i :class="icon.value"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">
              ยกเลิก
            </button>
            <button type="submit" class="btn btn-primary">
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
import Swal from 'sweetalert2'
import TransactionForm from './shared/TransactionForm.vue' // เพิ่ม import

export default {
  name: 'CloudPocket',
  components: {
    TransactionForm // เพิ่ม component registration
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
    const showEditModal = ref(false) // เพิ่ม ref สำหรับ modal แก้ไข
    const editingPocket = ref(null) // เพิ่ม ref สำหรับข้อมูลที่กำลังแก้ไข
    const isSelectMode = ref(false)
    const selectedPockets = ref([])

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
      const transactions = type === 'income' 
        ? store.state.income.filter(t => t.pocketId === pocketId)
        : store.state.expenses.filter(t => t.pocketId === pocketId)
      
      return transactions.reduce((sum, t) => {
        // ตรวจสอบว่า amount เป็นตัวเลขหรือไม่
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
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

    const toggleSelectMode = () => {
      isSelectMode.value = !isSelectMode.value
      if (!isSelectMode.value) {
        selectedPockets.value = []
      }
    }

    const togglePocketSelection = (pocketId, type = 'income') => {
      const index = selectedPockets.value.findIndex(p => p.id === pocketId)
      if (index === -1) {
        selectedPockets.value.push({ id: pocketId, type })
      } else {
        selectedPockets.value.splice(index, 1)
      }
    }

    const isPocketSelected = (pocketId) => {
      return selectedPockets.value.some(p => p.id === pocketId)
    }

    const deleteSelectedPockets = async () => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบหมวดหมู่ที่เลือกทั้งหมด ${selectedPockets.value.length} รายการหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        for (const pocket of selectedPockets.value) {
          // ลบข้อมูลรายการที่เกี่ยวข้องกับหมวดหมู่นี้
          if (pocket.type === 'income') {
            store.commit('deleteTransactionsByPocketId', {
              type: 'income',
              pocketId: pocket.id
            })
          } else {
            store.commit('deleteTransactionsByPocketId', {
              type: 'expenses',
              pocketId: pocket.id
            })
          }
          // ลบหมวดหมู่
          store.commit('deletePocket', {
            type: pocket.type,
            pocketId: pocket.id
          })
        }
        selectedPockets.value = []
        isSelectMode.value = false
      }
    }

    const deletePocket = async (pocket) => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบหมวดหมู่ "${pocket.name}" หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        // ลบข้อมูลรายการที่เกี่ยวข้องกับหมวดหมู่นี้
        store.commit('deleteTransactionsByPocketId', {
          type: pocket.type === 'income' ? 'income' : 'expenses',
          pocketId: pocket.id
        })
        // ลบหมวดหมู่
        store.commit('deletePocket', {
          type: pocket.type,
          pocketId: pocket.id
        })
      }
    }

    // แก้ไขฟังก์ชัน editPocket
    const editPocket = (pocket) => {
      editingPocket.value = { ...pocket }
      showEditModal.value = true
    }

    // แก้ไขฟังก์ชัน closeEditModal
    const closeEditModal = () => {
      showEditModal.value = false
      editingPocket.value = null
    }

    // แก้ไขฟังก์ชัน updatePocket
    const updatePocket = () => {
      if (editingPocket.value) {
        store.commit('updatePocket', {
          type: editingPocket.value.type || 'income',
          pocket: editingPocket.value
        })
        closeEditModal()
      }
    }

    const handlePocketClick = (pocket) => {
      if (isSelectMode.value) {
        togglePocketSelection(pocket.id, pocket.type || 'income')
      } else {
        selectPocket(pocket)
      }
    }

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
      availableIcons,
      isSelectMode,
      selectedPockets,
      toggleSelectMode,
      isPocketSelected,
      togglePocketSelection,
      handlePocketClick,
      showEditModal,
      editingPocket,
      editPocket,
      closeEditModal,
      updatePocket,
      deletePocket,
      deleteSelectedPockets
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.pocket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.pocket-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  cursor: pointer;
}

.pocket-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.2rem;
}

.pocket-card.income .pocket-icon {
  background: #e8f5e9;
  color: #2e7d32;
}

.pocket-card.expense .pocket-icon {
  background: #ffebee;
  color: #c62828;
}

.pocket-info h4 {
  margin: 0;
  font-size: 1rem;
}

.pocket-info .amount {
  margin: 0;
  font-size: 0.9rem;
}

.pocket-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pocket-card:hover .pocket-actions {
  opacity: 1;
}

.pocket-checkbox {
  padding: 0 0.5rem;
}

.form-check-input {
  cursor: pointer;
}

.pocket-card.multi-selected {
  background-color: #f8f9fa;
  border: 2px solid var(--primary-color);
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