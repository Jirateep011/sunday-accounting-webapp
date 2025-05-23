<template>
  <div class="analyze container-fluid">
    <!-- Header Section -->
    <div class="section-header">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h2 class="mb-0">วิเคราะห์รายรับ-รายจ่าย</h2>
        <div class="d-flex flex-wrap align-items-center gap-3">
          <!-- Period Selector -->
          <div class="period-selector d-flex align-items-center gap-3">
            <div class="input-group month-select">
              <label class="input-group-text">เดือน</label>
              <select v-model="selectedMonth" class="form-select">
                <option v-for="(month, index) in months" 
                        :key="index" 
                        :value="index">
                  {{ month }}
                </option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-group-text">ปี</label>
              <select v-model="selectedYear" class="form-select">
                <option v-for="year in yearRange" 
                        :key="year" 
                        :value="year">
                  {{ year + 543 }}
                </option>
              </select>
            </div>
          </div>

          <!-- Download Button -->
          <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown">
              <i class="bi bi-download me-2"></i>
              ดาวน์โหลดรายงาน
            </button>
            <ul class="dropdown-menu">
              <li class="dropdown-header">เลือกประเภทรายการ</li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <div class="px-3 py-2">
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" 
                           v-model="exportType" value="all" 
                           id="exportAll">
                    <label class="form-check-label" for="exportAll">
                      ทั้งรายรับและรายจ่าย
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" 
                           v-model="exportType" value="income" 
                           id="exportIncome">
                    <label class="form-check-label" for="exportIncome">
                      รายรับ
                    </label>
                  </div>
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" 
                           v-model="exportType" value="expense" 
                           id="exportExpense">
                    <label class="form-check-label" for="exportExpense">
                      รายจ่าย
                    </label>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary w-50"
                            @click="exportToPDF">
                      <i class="bi bi-file-pdf me-1"></i> PDF
                    </button>
                    <button class="btn btn-sm btn-outline-success w-50"
                            @click="exportToExcel">
                      <i class="bi bi-file-excel me-1"></i> Excel
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-4 mt-3">
      <div class="col-12 col-md-4">
        <div class="card summary-card income">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <h6 class="mb-1">รายรับทั้งหมด</h6>
                <h3 class="mb-0">{{ formatAmount(totalIncome) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card summary-card expense">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="bi bi-graph-down-arrow"></i>
              </div>
              <div>
                <h6 class="mb-1">รายจ่ายทั้งหมด</h6>
                <h3 class="mb-0">{{ formatAmount(totalExpenses) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card summary-card balance">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="bi bi-wallet2"></i>
              </div>
              <div>
                <h6 class="mb-1">คงเหลือ</h6>
                <h3 class="mb-0">{{ formatAmount(balance) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4 mt-4">
      <!-- Income Chart -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-4">สัดส่วนรายรับตามหมวดหมู่</h5>
            <div v-if="incomeChartData.labels.length > 0" class="chart-container">
              <canvas ref="incomeChart"></canvas>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-pie-chart"></i>
              <p>ไม่พบข้อมูลรายรับในช่วงเวลาที่เลือก</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Chart -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-4">สัดส่วนรายจ่ายตามหมวดหมู่</h5>
            <div v-if="expenseChartData.labels.length > 0" class="chart-container">
              <canvas ref="expenseChart"></canvas>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-pie-chart"></i>
              <p>ไม่พบข้อมูลรายจ่ายในช่วงเวลาที่เลือก</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable' // แก้ไขการ import
import addThaiFonts from '../utils/fonts'
import * as XLSX from 'xlsx'

export default {
  name: 'Analyze',
  setup() {
    const store = useStore()
    const incomeChart = ref(null)
    const expenseChart = ref(null)
    const exportType = ref('all')
    let incomeChartInstance = null
    let expenseChartInstance = null

    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const currentYear = new Date().getFullYear()
    const yearRange = Array.from(
      { length: 11 }, 
      (_, i) => currentYear - 5 + i
    )

    const selectedMonth = ref(new Date().getMonth())
    const selectedYear = ref(currentYear)

    // Chart Data Computeds
    const filteredIncome = computed(() => {
      return store.state.income.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() === selectedMonth.value &&
               date.getFullYear() === selectedYear.value
      })
    })

    const filteredExpenses = computed(() => {
      return store.state.expenses.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() === selectedMonth.value &&
               date.getFullYear() === selectedYear.value
      })
    })

    const incomeChartData = computed(() => {
      const data = {}
      filteredIncome.value.forEach(item => {
        const pocket = store.state.incomePockets.find(p => p.id === item.pocketId)
        const category = pocket ? pocket.name : 'ไม่ระบุหมวดหมู่'
        data[category] = (data[category] || 0) + Number(item.amount)
      })

      return {
        labels: Object.keys(data),
        data: Object.values(data)
      }
    })

    const expenseChartData = computed(() => {
      const data = {}
      filteredExpenses.value.forEach(item => {
        const pocket = store.state.expensePockets.find(p => p.id === item.pocketId)
        const category = pocket ? pocket.name : 'ไม่ระบุหมวดหมู่'
        data[category] = (data[category] || 0) + Number(item.amount)
      })

      return {
        labels: Object.keys(data),
        data: Object.values(data)
      }
    })

    const totalIncome = computed(() => {
      return filteredIncome.value.reduce((sum, item) => sum + Number(item.amount), 0)
    })

    const totalExpenses = computed(() => {
      return filteredExpenses.value.reduce((sum, item) => sum + Number(item.amount), 0)
    })

    const balance = computed(() => {
      return totalIncome.value - totalExpenses.value
    })

    // Methods
    const formatAmount = (amount) => {
      return Number(amount).toLocaleString('th-TH')
    }

    const createChart = (canvas, data, type) => {
      // แยกโทนสีสำหรับรายรับและรายจ่าย
      const incomeColors = [
        '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9',
        '#2E7D32', '#388E3C', '#43A047', '#66BB6A', '#98EE99'
      ]

      const expenseColors = [
        '#F44336', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE',
        '#C62828', '#D32F2F', '#E53935', '#F44336', '#FF5252'
      ]

      // เลือกชุดสีตามประเภท
      const colors = type === 'income' ? incomeColors : expenseColors

      // ทำลายกราฟเก่าถ้ามี
      if (canvas._chart) {
        canvas._chart.destroy()
      }

      const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.data,
            backgroundColor: colors.slice(0, data.labels.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: 'Prompt',
                  size: 12
                },
                padding: 15
              }
            }
          },
          animation: {
            duration: 1000
          }
        }
      })

      // เก็บ instance ไว้สำหรับการทำลายภายหลัง
      canvas._chart = chart
      return chart
    }

    const updateCharts = () => {
      // อัพเดทกราฟรายรับ
      if (incomeChart.value && incomeChartData.value.labels.length > 0) {
        createChart(incomeChart.value, incomeChartData.value, 'income')
      }
      // อัพเดทกราฟรายจ่าย
      if (expenseChart.value && expenseChartData.value.labels.length > 0) {
        createChart(expenseChart.value, expenseChartData.value, 'expense')
      }
    }

    // Helper function to get data based on export type
    const getExportData = () => {
      const data = {
        income: [],
        expense: []
      }

      if (exportType.value === 'all' || exportType.value === 'income') {
        data.income = filteredIncome.value.map(item => ({
          date: new Date(item.date).toLocaleDateString('th-TH'),
          type: 'รายรับ',
          category: store.state.incomePockets.find(p => p.id === item.pocketId)?.name || 'ไม่ระบุ',
          description: item.description,
          amount: Number(item.amount).toLocaleString('th-TH')
        }))
      }

      if (exportType.value === 'all' || exportType.value === 'expense') {
        data.expense = filteredExpenses.value.map(item => ({
          date: new Date(item.date).toLocaleDateString('th-TH'),
          type: 'รายจ่าย',
          category: store.state.expensePockets.find(p => p.id === item.pocketId)?.name || 'ไม่ระบุ',
          description: item.description,
          amount: Number(item.amount).toLocaleString('th-TH')
        }))
      }

      return exportType.value === 'all' 
        ? [...data.income, ...data.expense]
        : data[exportType.value]
    }

    // Export to PDF
    const exportToPDF = () => {
      try {

        addThaiFonts()

        const doc = new jsPDF()
        const data = getExportData()
        
        // กำหนดฟอนต์เริ่มต้น
        doc.setFont('THSarabunNew', 'normal')
        doc.setFontSize(16)

        // เพิ่มหัวข้อ
        doc.text(
          `รายงานการเงิน ${months[selectedMonth.value]} ${selectedYear.value + 543}`,
          doc.internal.pageSize.getWidth() / 2,
          15,
          { align: 'center' }
        )

        // สร้างตาราง
        autoTable(doc, {
          head: [['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน']],
          body: data.map(item => [
            item.date,
            item.type,
            item.category,
            item.description,
            item.amount
          ]),
          startY: 25,
          headStyles: {
            fillColor: [108, 92, 231],
            textColor: [255, 255, 255],
            fontSize: 12,
            font: 'THSarabunNew',
            fontStyle: 'bold'
          },
          styles: {
            font: 'THSarabunNew', // ต้องระบุทั้งใน styles หลัก
            fontSize: 10
          },
          bodyStyles: {
            font: 'THSarabunNew' // และใน bodyStyles
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          },
          theme: 'grid'
        })

        // เพิ่มสรุป
        const summary = []
        if (exportType.value === 'all' || exportType.value === 'income') {
          summary.push(['รายรับทั้งหมด', formatAmount(totalIncome.value) + ' ฿'])
        }
        if (exportType.value === 'all' || exportType.value === 'expense') {
          summary.push(['รายจ่ายทั้งหมด', formatAmount(totalExpenses.value) + ' ฿'])
        }
        if (exportType.value === 'all') {
          summary.push(['คงเหลือ', formatAmount(balance.value) + ' ฿'])
        }

        const finalY = doc.lastAutoTable?.finalY || 25
        
        autoTable(doc, {
          body: summary,
          startY: finalY + 10,
          theme: 'plain',
          styles: {
            font: 'helvetica',
            fontSize: 10
          },
          columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right' }
          }
        })

        // บันทึกไฟล์
        doc.save(`รายงาน_${months[selectedMonth.value]}_${selectedYear.value + 543}.pdf`)
      } catch (error) {
        console.error('PDF Export Error:', error)
      }
    }

    // Export to Excel
    const exportToExcel = () => {
      const data = getExportData()
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      
      // Add worksheet
      XLSX.utils.book_append_sheet(wb, ws, 'รายงาน')
      
      // Save file
      XLSX.writeFile(
        wb, 
        `รายงาน_${months[selectedMonth.value]}_${selectedYear.value + 543}.xlsx`
      )
    }

    // เพิ่ม watcher สำหรับ data changes
    watch([selectedMonth, selectedYear, () => store.state.income, () => store.state.expenses], () => {
      nextTick(() => {
        updateCharts()
      })
    }, { deep: true })

    onMounted(() => {
      updateCharts()
    })

    onMounted(() => {
      // โหลดฟอนต์ไทย
      addThaiFonts()
    })

    return {
      months,
      yearRange,
      selectedMonth,
      selectedYear,
      incomeChart,
      expenseChart,
      totalIncome,
      totalExpenses,
      balance,
      formatAmount,
      incomeChartData,
      expenseChartData,
      exportType,
      exportToPDF,
      exportToExcel
    }
  }
}
</script>

<style scoped>
.section-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.summary-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.summary-card.income .icon-wrapper {
  background: #e8f5e9;
  color: var(--success-color);
}

.summary-card.expense .icon-wrapper {
  background: #ffebee;
  color: var(--danger-color);
}

.summary-card.balance .icon-wrapper {
  background: var(--primary-light);
  color: var(--primary-color);
}

.month-select {
  min-width: 180px; /* เพิ่มความกว้างของช่องเลือกเดือน */
}

.form-select {
  cursor: pointer;
  font-size: 0.95rem;
}

.chart-container {
  position: relative;
  height: 350px; /* เพิ่มความสูงของกราฟ */
  margin: 1rem 0;
}

/* ปรับแต่ง chart legend */
:deep(.chart-legend) {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-light);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.dropdown-menu {
  min-width: 250px;
}

.form-check-label {
  cursor: pointer;
}

@media (max-width: 768px) {
  .section-header {
    padding: 1rem;
  }

  .period-selector {
    width: 100%;
    flex-wrap: wrap;
  }

  .input-group {
    flex: 1;
    min-width: 150px;
  }

  .month-select {
    min-width: 100%;
    margin-bottom: 0.5rem;
  }

  .chart-container {
    height: 250px;
  }
}
</style>