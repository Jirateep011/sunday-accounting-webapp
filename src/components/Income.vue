<template>
  <div class="income container-fluid">
    <!-- Header Section -->
    <div class="section-header">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h2 class="mb-0">รายการรายรับ</h2>
        <div class="d-flex align-items-center gap-3">
          <div class="filter-section d-flex align-items-center gap-2">
            <label class="text-nowrap">แสดง:</label>
            <select v-model="itemsPerPage" class="form-select form-select-sm">
              <option value="10">10 รายการ</option>
              <option value="30">30 รายการ</option>
              <option value="100">100 รายการ</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" @click="showAddForm = !showAddForm">
            <i class="bi" :class="showAddForm ? 'bi-x-lg' : 'bi-plus-lg'"></i>
            {{ showAddForm ? 'ปิด' : 'เพิ่มรายการ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">{{ editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการ' }}</h3>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <transaction-form 
            :selected-date="selectedDate"
            :editing-transaction="editingTransaction"
            @transaction-added="handleTransactionAdded"
            @cancel="closeForm"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-4 mt-2">
      <!-- Calendar Column -->
      <div class="col-12 col-lg-4 order-2 order-lg-1">
        <div class="calendar-wrapper">
          <Calendar 
            v-model:selectedDate="selectedDate" 
            @dateSelected="handleDateSelected"
          />
          
          <!-- Summary Card -->
          <div class="summary-card mt-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">สรุปรายรับ</h5>
                <div class="summary-item">
                  <span>วันที่เลือก</span>
                  <span class="amount">{{ selectedDateTotal }} ฿</span>
                </div>
                <div class="summary-item">
                  <span>เดือนนี้</span>
                  <span class="amount">{{ currentMonthTotal }} ฿</span>
                </div>
                <div class="summary-item">
                  <span>ทั้งหมด</span>
                  <span class="amount">{{ totalIncome }} ฿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table Column -->
      <div class="col-12 col-lg-8 order-1 order-lg-2">
        <div class="card h-100">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>รายละเอียด</th>
                    <th>หมวดหมู่</th>
                    <th class="text-end">จำนวน</th>
                    <th class="text-end">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in filteredAndPaginatedEntries" 
                      :key="entry.id"
                      class="transaction-row">
                    <td>{{ formatDate(entry.date) }}</td>
                    <td>{{ entry.description }}</td>
                    <td>
                      <span class="category-badge">
                        {{ getPocketName(entry.pocketId) }}
                      </span>
                    </td>
                    <td class="text-success text-end">{{ formatAmount(entry.amount) }} ฿</td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary btn-sm" @click="editTransaction(entry)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteTransaction(entry)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredAndPaginatedEntries.length === 0">
                    <td colspan="5" class="text-center py-4">
                      <div class="empty-state">
                        <i class="bi bi-inbox text-muted"></i>
                        <p>ไม่พบรายการ</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-section mt-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div class="text-muted">
              แสดง {{ startIndex + 1 }} ถึง {{ endIndex }} จาก {{ sortedIncomeEntries.length }} รายการ
            </div>
            <nav v-if="totalPages > 1">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                <li v-for="page in displayedPages" 
                    :key="page" 
                    class="page-item"
                    :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">
                    {{ page }}
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import Calendar from './shared/Calendar.vue'
import TransactionForm from './shared/TransactionForm.vue'
import Swal from 'sweetalert2'

export default {
  components: {
    Calendar,
    TransactionForm
  },
  setup() {
    const store = useStore()
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const selectedDate = ref(new Date())
    const showAddForm = ref(false)
    const editingTransaction = ref(null)

    const sortedIncomeEntries = computed(() => {
      return [...store.state.income].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
    })

    const totalPages = computed(() => {
      return Math.ceil(sortedIncomeEntries.value.length / itemsPerPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value
    })

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage.value, sortedIncomeEntries.value.length)
    })

    const paginatedIncome = computed(() => {
      return sortedIncomeEntries.value.slice(startIndex.value, endIndex.value)
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const handleDateSelected = (date) => {
      // ปรับเวลาให้เป็น 00:00:00
      const newDate = new Date(date)
      newDate.setHours(0, 0, 0, 0)
      selectedDate.value = newDate
    }

    // แก้ไข filteredEntries computed
    const filteredEntries = computed(() => {
      if (!selectedDate.value) return store.state.income
      
      return store.state.income.filter(entry => {
        const entryDate = new Date(entry.date)
        const selected = new Date(selectedDate.value)
        // เปรียบเทียบเฉพาะวันที่
        return entryDate.getDate() === selected.getDate() && 
               entryDate.getMonth() === selected.getMonth() && 
               entryDate.getFullYear() === selected.getFullYear()
      })
    })

    const filteredAndPaginatedEntries = computed(() => {
      return store.state.income // เปลี่ยนจาก store.state[activeTab.value]
        .filter(entry => {
          if (!selectedDate.value) return true
          const entryDate = new Date(entry.date)
          return entryDate.toDateString() === selectedDate.value.toDateString()
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(startIndex.value, endIndex.value)
    })

    // เพิ่มการคำนวณยอดรวมตามวันที่ที่เลือก
    const filteredTotalIncome = computed(() => {
      return filteredEntries.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })

    // Watch for itemsPerPage changes
    watch(itemsPerPage, () => {
      currentPage.value = 1
    })

    // New computed properties
    const selectedDateTotal = computed(() => {
      return filteredEntries.value
        .reduce((total, entry) => total + Number(entry.amount), 0)
    })

    const currentMonthTotal = computed(() => {
      const now = new Date()
      return store.state.income
        .filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate.getMonth() === now.getMonth() &&
                 entryDate.getFullYear() === now.getFullYear()
        })
        .reduce((total, entry) => total + Number(entry.amount), 0)
    })

    const getPocketName = (pocketId) => {
      const pocket = store.state.incomePockets.find(p => p.id === pocketId)
      return pocket?.name || 'ไม่ระบุหมวดหมู่'
    }

    const formatAmount = (amount) => {
      return Number(amount).toLocaleString('th-TH')
    }

    const handleTransactionAdded = () => {
      showAddForm.value = false
      editingTransaction.value = null
    }

    const closeForm = () => {
      showAddForm.value = false
      editingTransaction.value = null
    }

    const editTransaction = (transaction) => {
      editingTransaction.value = transaction
      showAddForm.value = true // จะแสดง Modal
    }

    const deleteTransaction = async (transaction) => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'ต้องการลบรายการนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        store.dispatch('deleteTransaction', {
          type: 'income',
          id: transaction.id
        })
      }
    }

    return {
      currentPage,
      itemsPerPage,
      totalPages,
      startIndex,
      endIndex,
      paginatedIncome,
      displayedPages,
      changePage,
      formatDate,
      sortedIncomeEntries,
      totalIncome: filteredTotalIncome, // เปลี่ยนจาก store.getters.totalIncome
      selectedDate,
      filteredEntries,
      filteredAndPaginatedEntries,
      showAddForm,
      selectedDateTotal,
      currentMonthTotal,
      getPocketName,
      formatAmount,
      handleTransactionAdded,
      editTransaction,
      closeForm,
      editingTransaction,
      deleteTransaction,
      handleDateSelected
    }
  }
}
</script>

<style scoped>
.section-header {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.calendar-wrapper {
  position: sticky;
  top: 1rem;
}

.summary-card .card-title {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .amount {
  font-weight: 600;
  color: var(--success-color);
}

.transaction-row {
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: var(--primary-light);
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-state i {
  font-size: 2rem;
}

.empty-state p {
  margin: 0;
  color: var(--text-light);
}

.page-link {
  border: none;
  margin: 0 0.25rem;
  border-radius: 0.5rem;
  color: var(--text-color);
}

.page-item.active .page-link {
  background: var(--primary-color);
}

.btn-group-sm .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* เพิ่ม CSS สำหรับ Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

/* ปรับแต่ง TransactionForm ภายใน Modal */
:deep(.transaction-form) {
  max-width: 100%;
  padding: 0;
  background: transparent;
}

@media (max-width: 768px) {
  .section-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .summary-card {
    margin-top: 1rem;
  }

  .table th,
  .table td {
    padding: 1rem;
  }

  .category-badge {
    padding: 0.25rem 0.5rem;
  }
}
</style>