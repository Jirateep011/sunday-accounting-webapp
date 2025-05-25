<template>
  <div class="calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <button class="btn btn-icon" @click="previousMonth">
        <i class="bi bi-chevron-left"></i>
      </button>
      <div class="current-date" @click="toggleDropdown">
        <h5 class="mb-0">{{ months[selectedMonth] }} {{ selectedYear + 543 }}</h5>
        <i class="bi bi-chevron-down ms-2"></i>
      </div>
      <button class="btn btn-icon" @click="nextMonth">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Month/Year Dropdown -->
      <div v-if="showDropdown" class="date-dropdown">
        <div class="month-selector">
          <div class="month-grid">
            <button v-for="(month, index) in months" 
                    :key="index"
                    :class="['month-btn', { active: selectedMonth === index }]"
                    @click="selectMonth(index)">
              {{ month }}
            </button>
          </div>
        </div>
        <div class="year-selector">
          <div class="year-list">
            <button v-for="year in yearRange" 
                    :key="year"
                    :class="['year-btn', { active: selectedYear === year }]"
                    @click="selectYear(year)">
              {{ year + 543 }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Body -->
    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in calendar" 
             :key="day.date" 
             class="day"
             :class="{
               'selected': isSelectedDate(day.date),
               'has-transactions': hasTransactions(day.date),
               'outside-month': !day.currentMonth,
               'today': isToday(day.date)
             }"
             @click="selectDate(day.date)">
          <span class="date">{{ new Date(day.date).getDate() }}</span>
          <div v-if="hasTransactions(day.date)" class="transaction-indicators">
            <div v-if="getIncomeForDate(day.date)" class="income-indicator"></div>
            <div v-if="getExpensesForDate(day.date)" class="expense-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Calendar',
  props: {
    selectedDate: {
      type: Date,
      required: true,
      default: () => new Date()
    }
  },
  emits: ['update:selectedDate', 'dateSelected'],
  
  setup(props, { emit }) {
    const store = useStore()
    const currentDate = ref(new Date(props.selectedDate))
    const showDropdown = ref(false)
    
    // เพิ่มรายชื่อเดือนภาษาไทย
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    
    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    
    // สร้างช่วงปีย้อนหลัง 5 ปี และล่วงหน้า 5 ปี
    const currentYear = new Date().getFullYear()
    const yearRange = Array.from(
      { length: 11 }, 
      (_, i) => currentYear - 5 + i
    )

    // เพิ่ม ref สำหรับเดือนและปีที่เลือก
    const selectedMonth = ref(currentDate.value.getMonth())
    const selectedYear = ref(currentDate.value.getFullYear())

    // อัพเดทวันที่เมื่อมีการเปลี่ยนเดือนหรือปี
    watch([selectedMonth, selectedYear], ([month, year]) => {
      currentDate.value = new Date(year, month, 1)
    })
    
    const currentMonthYear = computed(() => {
      return `${months[selectedMonth.value]} ${selectedYear.value + 543}`
    })
    
    const calendar = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const weeks = []
      let currentWeek = []
      
      // Fill in leading empty days
      for (let i = 0; i < firstDay.getDay(); i++) {
        const prevMonth = new Date(year, month, 0)
        const prevMonthDay = prevMonth.getDate() - firstDay.getDay() + i + 1
        currentWeek.push({
          date: new Date(year, month - 1, prevMonthDay),
          currentMonth: false
        })
      }
      
      // Fill in days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push({
          date: new Date(year, month, day),
          currentMonth: true
        })
        
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
      }
      
      // Fill in trailing empty days
      if (currentWeek.length > 0) {
        const nextMonth = new Date(year, month + 1, 1)
        for (let i = 1; currentWeek.length < 7; i++) {
          currentWeek.push({
            date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
            currentMonth: false
          })
        }
        weeks.push([...currentWeek])
      }
      
      return weeks.flat() // Flatten the array of weeks
    })

    const selectDate = (date) => {
      if (!date) return
      const selectedDate = new Date(date)
      // ปรับเวลาให้เป็น 00:00:00
      selectedDate.setHours(0, 0, 0, 0)
      emit('update:selectedDate', selectedDate)
      emit('dateSelected', selectedDate)
    }

    // ปรับปรุงฟังก์ชัน isSelectedDate
    const isSelectedDate = (date) => {
      if (!date || !props.selectedDate) return false
      const d1 = new Date(date)
      const d2 = new Date(props.selectedDate)
      // เปรียบเทียบเฉพาะวันที่
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear()
    }

    const getIncomeForDate = (date) => {
      if (!date) return false
      return store.state.income.some(income => {
        const incomeDate = new Date(income.date)
        return incomeDate.toDateString() === date.toDateString()
      })
    }
    
    const getExpensesForDate = (date) => {
      if (!date) return false
      return store.state.expenses.some(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.toDateString() === date.toDateString()
      })
    }

    const hasTransactions = (date) => {
      if (!date) return false
      return getIncomeForDate(date) || getExpensesForDate(date)
    }

    // เพิ่ม watcher สำหรับ props.selectedDate
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        currentDate.value = newDate
        selectedMonth.value = newDate.getMonth()
        selectedYear.value = newDate.getFullYear()
      }
    })

    const isToday = (date) => {
      if (!date) return false
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const previousMonth = () => {
      if (selectedMonth.value === 0) {
        selectedMonth.value = 11
        selectedYear.value--
      } else {
        selectedMonth.value--
      }
    }
    
    const nextMonth = () => {
      if (selectedMonth.value === 11) {
        selectedMonth.value = 0
        selectedYear.value++
      } else {
        selectedMonth.value++
      }
    }
    
    // เพิ่มฟังก์ชันใหม่
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }
    
    const selectMonth = (month) => {
      selectedMonth.value = month
      showDropdown.value = false
    }
    
    const selectYear = (year) => {
      selectedYear.value = year
      showDropdown.value = false
    }
    
    // ปิด dropdown เมื่อคลิกที่อื่น
    onMounted(() => {
      document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.dropdown')
        if (dropdown && !dropdown.contains(e.target)) {
          showDropdown.value = false
        }
      })
    })

    return {
      calendar,
      weekDays,
      months,
      selectedMonth: computed(() => currentDate.value.getMonth()),
      selectedYear: computed(() => currentDate.value.getFullYear()),
      currentMonthYear,
      selectDate,
      isSelectedDate,
      hasTransactions,
      getIncomeForDate,
      getExpensesForDate,
      previousMonth,
      nextMonth,
      showDropdown,
      toggleDropdown,
      selectMonth,
      selectYear,
      isToday,
    }
  }
}
</script>

<style scoped>
.calendar {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
}

.current-date {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  transition: background-color 0.2s ease;
}

.current-date:hover {
  background-color: var(--primary-light);
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: none;
  background: var(--primary-light);
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--primary-color);
  color: white;
}

.calendar-body {
  margin-top: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-light);
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.75rem;
  position: relative;
  transition: all 0.2s ease;
  background: white;
  min-height: 40px; /* Ensure minimum height for mobile */
  padding: 0.25rem;
}

.day:hover {
  background: var(--primary-light);
}

.date {
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.outside-month {
  color: var(--text-light);
  opacity: 0.5;
}

.selected {
  background: var(--primary-color) !important;
  color: white;
}

.today {
  background: var(--primary-light);
  font-weight: 600;
}

.transaction-indicators {
  display: flex;
  gap: 0.25rem;
  position: absolute;
  bottom: 0.25rem;
}

.income-indicator, .expense-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.income-indicator {
  background: var(--success-color);
}

.expense-indicator {
  background: var(--danger-color);
}

.date-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 1rem;
  margin-top: 0.5rem;
  z-index: 1000;
  min-width: 280px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.month-btn, .year-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-btn:hover, .year-btn:hover {
  background: var(--primary-light);
}

.month-btn.active, .year-btn.active {
  background: var(--primary-color);
  color: white;
}

.year-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .calendar {
    padding: 1rem;
  }

  .calendar-header {
    margin-bottom: 1rem;
  }

  .calendar-grid {
    gap: 0.25rem;
  }

  .calendar-day {
    border-radius: 0.5rem;
    min-height: 35px;
  }

  .day-number {
    font-size: 0.813rem;
  }

  .weekday {
    font-size: 0.75rem;
  }

  .date-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 320px;
    margin: 0;
  }
}

/* Small Screen Optimization */
@media (max-width: 375px) {
  .calendar {
    padding: 0.75rem;
  }

  .btn-icon {
    width: 32px;
    height: 32px;
  }

  .current-date h5 {
    font-size: 1rem;
  }

  .weekday {
    padding: 0.25rem 0;
  }
}
</style>