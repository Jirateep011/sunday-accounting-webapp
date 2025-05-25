<template>
  <div class="dashboard">
    <!-- Overview Cards -->
    <div class="overview-cards row g-3 mb-4">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon income">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="card-info">
              <h3>รายรับทั้งหมด</h3>
              <h2>{{ filteredTotalIncome }} ฿</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon expenses">
              <i class="bi bi-graph-down-arrow"></i>
            </div>
            <div class="card-info">
              <h3>รายจ่ายทั้งหมด</h3>
              <h2>{{ filteredTotalExpenses }} ฿</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon balance">
              <i class="bi bi-wallet2"></i>
            </div>
            <div class="card-info">
              <h3>เงินคงเหลือ</h3>
              <h2>{{ filteredBalance }} ฿</h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4">
      <!-- Calendar Column -->
      <div class="col-12 col-lg-4 order-2 order-lg-1">
        <div class="card h-100">
          <div class="card-body">
            <Calendar v-model:selectedDate="selectedDate" />
          </div>
        </div>
      </div>

      <!-- Transaction Form Column -->
      <div class="col-12 col-lg-4 order-1 order-lg-2">
        <div class="card h-100">
          <div class="card-body">
            <transaction-form 
              :selected-date="selectedDate"
              @transaction-added="handleTransaction" 
            />
          </div>
        </div>
      </div>

      <!-- Recent Transactions Column -->
      <div class="col-12 col-lg-4 order-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="transactions-header">
              <h3>รายการล่าสุด</h3>
              <div class="tabs">
                <button 
                  :class="['tab-btn', { active: activeTab === 'income' }]"
                  @click="activeTab = 'income'"
                >
                  รายรับ
                </button>
                <button 
                  :class="['tab-btn', { active: activeTab === 'expenses' }]"
                  @click="activeTab = 'expenses'"
                >
                  รายจ่าย
                </button>
              </div>
            </div>
            
            <div class="transactions-list" v-if="activeTab === 'income'">
              <div v-for="entry in recentIncome" 
                   :key="entry.id" 
                   class="transaction-item">
                <div class="transaction-info">
                  <span class="description">{{ entry.description }}</span>
                  <span class="date">{{ formatDate(entry.date) }}</span>
                </div>
                <span class="amount income">+{{ entry.amount }} ฿</span>
              </div>
            </div>

            <div class="transactions-list" v-else>
              <div v-for="entry in recentExpenses" 
                   :key="entry.id" 
                   class="transaction-item">
                <div class="transaction-info">
                  <span class="description">{{ entry.description }}</span>
                  <span class="date">{{ formatDate(entry.date) }}</span>
                </div>
                <span class="amount expenses">-{{ entry.amount }} ฿</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Calendar from './shared/Calendar.vue'
import TransactionForm from './shared/TransactionForm.vue'

export default {
  components: {
    Calendar,
    TransactionForm
  },
  setup() {
    const store = useStore()
    const selectedDate = ref(new Date())
    const activeTab = ref('income')
    
    const isInSelectedMonth = (date) => {
      const transactionDate = new Date(date)
      return (
        transactionDate.getMonth() === selectedDate.value.getMonth() &&
        transactionDate.getFullYear() === selectedDate.value.getFullYear()
      )
    }
    
    const filteredIncome = computed(() => {
      return store.state.income.filter(income => isInSelectedMonth(income.date))
    })
    
    const filteredExpenses = computed(() => {
      return store.state.expenses.filter(expense => isInSelectedMonth(expense.date))
    })
    
    // แก้ไขการคำนวณยอดรวมให้ใช้ข้อมูลที่กรองตามเดือน
    const filteredTotalIncome = computed(() => {
      return filteredIncome.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })
    
    const filteredTotalExpenses = computed(() => {
      return filteredExpenses.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })
    
    const filteredBalance = computed(() => {
      return filteredTotalIncome.value - filteredTotalExpenses.value
    })

    const recentIncome = computed(() => {
      return [...store.state.income]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })

    const recentExpenses = computed(() => {
      return [...store.state.expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })

    const handleTransaction = (transaction) => {
      if (transaction.type === 'income') {
        store.dispatch('addIncome', {
          ...transaction,
          id: Date.now(),
          date: new Date().toISOString()
        })
      } else {
        store.dispatch('addExpense', {
          ...transaction,
          id: Date.now(),
          date: new Date().toISOString()
        })
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('th-TH')
    }
    
    return {
      selectedDate,
      filteredTotalIncome,
      filteredTotalExpenses,
      filteredBalance,
      totalIncome: computed(() => store.getters.totalIncome),
      totalExpenses: computed(() => store.getters.totalExpenses),
      balance: computed(() => store.getters.balance),
      recentIncome,
      recentExpenses,
      handleTransaction,
      activeTab,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.2s ease;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-icon.income {
  background: #e1f8e9;
  color: #00c853;
}

.card-icon.expenses {
  background: #fbe9e7;
  color: #ff3d00;
}

.card-icon.balance {
  background: #e3f2fd;
  color: #2196f3;
}

.card-info {
  flex-grow: 1;
}

.card-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.card-info h2 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--background-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.description {
  font-weight: 500;
}

.date {
  font-size: 0.875rem;
  color: var(--text-light);
}

.amount {
  font-weight: 600;
}

.amount.income {
  color: #00c853;
}

.amount.expenses {
  color: #ff3d00;
}

@media (max-width: 768px) {
  .overview-card {
    padding: 1rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .card-info h2 {
    font-size: 1.25rem;
  }

  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
  }
}
</style>