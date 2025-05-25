<template>
  <div class="cloud-pocket container-fluid">
    <!-- Page Header -->
    <div class="section-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="mb-0">หมวดหมู่รายรับ-รายจ่าย</h2>
        <div class="actions">
          <!-- Delete selected button -->
          <button class="btn btn-danger btn-sm me-2" 
                  :disabled="!selectedPockets.length"
                  @click="deleteSelectedPockets">
            <i class="fa-solid fa-trash me-1"></i>
            ลบที่เลือก ({{ selectedPockets.length }})
          </button>

          <!-- Select mode toggle button -->
          <button class="btn btn-outline-secondary btn-sm" @click="toggleSelectMode">
            <i class="fa-solid" :class="isSelectMode ? 'fa-xmark' : 'fa-check-square'"></i>
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
            <!-- Add category buttons -->
            <button class="btn btn-outline-success btn-sm" @click="showAddPocketModal('income')">
              <i class="fa-solid fa-plus"></i>
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
                <!-- Edit and delete buttons in pocket cards -->
                <button class="btn btn-link btn-sm" @click.stop="editPocket({...pocket, type: 'income'})">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-link btn-sm text-danger" @click.stop="deletePocket({...pocket, type: 'income'})">
                  <i class="fa-solid fa-trash"></i>
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
              <i class="fa-solid fa-plus"></i>
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
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-link btn-sm text-danger" @click.stop="deletePocket({...pocket, type: 'expense'})">
                  <i class="fa-solid fa-trash"></i>
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
    <div ref="transactionsSection" class="row mt-4" v-if="selectedPocket">
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
            <transaction-form 
              :selected-date="selectedDate"
              :selected-pocket="selectedPocket" 
              @transaction-added="handleTransaction" 
            />
          </div>

          <!-- Transactions List -->
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="sort('date')" style="cursor: pointer;">
                    วันที่
                    <i :class="getSortIcon('date')" class="ms-1"></i>
                  </th>
                  <th @click="sort('description')" style="cursor: pointer;">
                    รายละเอียด
                    <i :class="getSortIcon('description')" class="ms-1"></i>
                  </th>
                  <th class="text-end" @click="sort('amount')" style="cursor: pointer;">
                    จำนวนเงิน
                    <i :class="getSortIcon('amount')" class="ms-1"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in sortedData" :key="transaction.id">
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
                  <td :class="['text-end fw-bold', pocketTotal >= 0 ? 'text-success' : 'text-danger']">
                    {{ pocketTotal.toLocaleString() }} ฿
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
              <nav>
                <ul class="pagination pagination-sm">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li v-for="page in displayedPages" 
                      :key="page" 
                      class="page-item"
                      :class="{ active: currentPage === page }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
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
import { ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'
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
    const showEditModal = ref(false)
    const editingPocket = ref(null)
    const isSelectMode = ref(false)
    const selectedPockets = ref([])
    // เพิ่ม selectedDate
    const selectedDate = ref(new Date())

    const incomePockets = computed(() => store.getters.getIncomePockets)
    const expensePockets = computed(() => store.getters.getExpensePockets)

    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const transactionsSection = ref(null)

    // Pagination logic
    const totalPages = computed(() => {
      return Math.ceil(pocketTransactions.value.length / itemsPerPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value
    })

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage.value, pocketTransactions.value.length)
    })

    const paginatedTransactions = computed(() => {
      return pocketTransactions.value.slice(startIndex.value, endIndex.value)
    })

    const displayedPages = computed(() => {
      const pages = []
      let start = Math.max(1, currentPage.value - 2)
      let end = Math.min(totalPages.value, start + 4)
      
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const scrollToTransactions = () => {
      // รอให้ DOM อัพเดทก่อนทำการ scroll
      nextTick(() => {
        if (transactionsSection.value) {
          transactionsSection.value.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    }

    const selectPocket = (pocket) => {
      if (isSelectMode.value) {
        togglePocketSelection(pocket.id, pocket.type || 'income')
      } else {
        selectedPocket.value = pocket
        currentPage.value = 1 // รีเซ็ตหน้าเป็นหน้าแรก
        scrollToTransactions() // เรียกใช้ฟังก์ชัน scroll
      }
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
      // Income related icons
      { value: 'fa-solid fa-sack-dollar' }, // ถุงเงิน
      { value: 'fa-solid fa-money-bill-trend-up' }, // แนวโน้มเงินขึ้น
      { value: 'fa-solid fa-coins' }, // เหรียญ
      { value: 'fa-solid fa-hand-holding-dollar' }, // มือถือเงิน
      { value: 'fa-solid fa-money-bill-wave' }, // ธนบัตร
      { value: 'fa-solid fa-piggy-bank' }, // กระปุกออมสิน
      { value: 'fa-solid fa-credit-card' }, // บัตรเครดิต
      { value: 'fa-solid fa-building-columns' }, // ธนาคาร
      
      // Expense related icons
      { value: 'fa-solid fa-cart-shopping' }, // รถเข็นช้อปปิ้ง
      { value: 'fa-solid fa-burger' }, // อาหาร
      { value: 'fa-solid fa-house' }, // บ้าน
      { value: 'fa-solid fa-car' }, // รถยนต์
      { value: 'fa-solid fa-graduation-cap' }, // การศึกษา
      { value: 'fa-solid fa-heart-pulse' }, // สุขภาพ
      { value: 'fa-solid fa-plane' }, // ท่องเที่ยว
      { value: 'fa-solid fa-shirt' }, // เสื้อผ้า
      { value: 'fa-solid fa-dumbbell' }, // ออกกำลังกาย
      { value: 'fa-solid fa-laptop' }, // อุปกรณ์อิเล็กทรอนิกส์
      { value: 'fa-solid fa-gamepad' }, // เกม
      { value: 'fa-solid fa-mobile-screen' }, // มือถือ
      { value: 'fa-solid fa-wifi' }, // อินเตอร์เน็ต
      { value: 'fa-solid fa-utensils' }, // ร้านอาหาร
      { value: 'fa-solid fa-gift' }, // ของขวัญ
      { value: 'fa-solid fa-palette' }, // งานอดิเรก
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

    // เพิ่มฟังก์ชัน showAddPocketModal
    const showAddPocketModal = (type) => {
      newPocketType.value = type
      showModal.value = true
      newPocket.value = {
        name: '',
        icon: 'fa-solid fa-wallet' // เปลี่ยนเป็น Font Awesome icon
      }
    }

    // Add sort functionality
    const sortConfig = ref({
      key: 'date', // default sort by date
      direction: 'desc' // default newest first
    })

    // Sort function
    const sort = (key) => {
      if (sortConfig.value.key === key) {
        // Toggle direction if clicking same column
        sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
      } else {
        // New column, set default to descending
        sortConfig.value.key = key
        sortConfig.value.direction = 'desc'
      }
    }

    // Sort icon component helper
    const getSortIcon = (key) => {
      if (sortConfig.value.key === key) {
        return sortConfig.value.direction === 'asc' 
          ? 'fa-solid fa-sort-up' 
          : 'fa-solid fa-sort-down'
      }
      return 'fa-solid fa-sort'
    }

    // Sorted data computed property
    const sortedData = computed(() => {
      const data = [...pocketTransactions.value]
      
      return data.sort((a, b) => {
        let compareResult = 0
        
        switch(sortConfig.value.key) {
          case 'date':
            compareResult = new Date(a.date) - new Date(b.date)
            break
          case 'amount':
            compareResult = Number(a.amount) - Number(b.amount)
            break
          case 'description':
            compareResult = a.description.localeCompare(b.description)
            break
          default:
            compareResult = 0
        }
        
        return sortConfig.value.direction === 'asc' ? compareResult : -compareResult
      })
    })

    // ปรับปรุง paginatedData
    const paginatedData = computed(() => {
      return sortedData.value.slice(startIndex.value, endIndex.value)
    })

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
      deleteSelectedPockets,
      selectedDate, // เพิ่ม selectedDate ใน return
      itemsPerPage,
      currentPage,
      totalPages,
      paginatedData,
      displayedPages,
      changePage,
      transactionsSection,
      // Sort functionality
      sort,
      getSortIcon,
      sortedData
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

  /* Mobile styles for pocket cards */
  .pocket-card {
    position: relative;
  }
  
  .pocket-actions {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    display: flex;
    gap: 0.5rem;
    opacity: 1;
  }

  .pocket-card:hover .pocket-actions {
    opacity: 1;
  }

  .pocket-actions button {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--white);
    border: 1px solid var(--border-color);
  }
}

/* Pagination styles */
.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
  color: var(--primary-color);
  background-color: var(--white);
  border: 1px solid var(--border-color);
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-item.disabled .page-link {
  color: var(--text-light);
  pointer-events: none;
  background-color: var(--white);
  border-color: var(--border-color);
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

.transaction-section {
  scroll-margin-top: 20px; /* เพิ่ม margin ด้านบนเวลา scroll */
}
</style>