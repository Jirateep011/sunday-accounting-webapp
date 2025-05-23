import { createStore } from 'vuex'

// ฟังก์ชันสำหรับโหลดข้อมูลจาก Local Storage
const loadState = () => {
  try {
    const income = localStorage.getItem('income')
    const expenses = localStorage.getItem('expenses')
    const incomePockets = localStorage.getItem('incomePockets')
    const expensePockets = localStorage.getItem('expensePockets')
    
    return {
      income: income ? JSON.parse(income) : [],
      expenses: expenses ? JSON.parse(expenses) : [],
      // เปลี่ยนค่าเริ่มต้นของ pockets เป็น array ว่าง
      incomePockets: incomePockets ? JSON.parse(incomePockets) : [],
      expensePockets: expensePockets ? JSON.parse(expensePockets) : []
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error)
    return {
      income: [],
      expenses: [],
      incomePockets: [],
      expensePockets: []
    }
  }
}

// ฟังก์ชันสำหรับบันทึกข้อมูลลง Local Storage
const saveState = (state) => {
  try {
    localStorage.setItem('income', JSON.stringify(state.income))
    localStorage.setItem('expenses', JSON.stringify(state.expenses))
    localStorage.setItem('incomePockets', JSON.stringify(state.incomePockets))
    localStorage.setItem('expensePockets', JSON.stringify(state.expensePockets))
  } catch (error) {
    console.error('Error saving state to localStorage:', error)
  }
}

export default createStore({
  state() {
    const loadedState = loadState()
    return {
      income: loadedState.income,
      expenses: loadedState.expenses,
      incomePockets: loadedState.incomePockets,
      expensePockets: loadedState.expensePockets
    }
  },
  mutations: {
    addIncome(state, incomeEntry) {
      state.income.push(incomeEntry)
      saveState(state) // บันทึกข้อมูลทุกครั้งที่มีการเพิ่มรายรับ
    },
    addExpense(state, expenseEntry) {
      state.expenses.push(expenseEntry)
      saveState(state) // บันทึกข้อมูลทุกครั้งที่มีการเพิ่มรายจ่าย
    },
    clearTransactions(state) {
      state.income = []
      state.expenses = []
      saveState(state) // บันทึกข้อมูลเมื่อล้างรายการ
    },
    addIncomePocket(state, pocket) {
      state.incomePockets.push(pocket)
      saveState(state)
    },
    addExpensePocket(state, pocket) {
      state.expensePockets.push(pocket)
      saveState(state)
    }
  },
  actions: {
    addIncome({ commit }, incomeEntry) {
      commit('addIncome', incomeEntry)
    },
    addExpense({ commit }, expenseEntry) {
      commit('addExpense', expenseEntry)
    },
    clearTransactions({ commit }) {
      commit('clearTransactions')
    },
    addIncomePocket({ commit }, pocket) {
      commit('addIncomePocket', pocket)
    },
    addExpensePocket({ commit }, pocket) {
      commit('addExpensePocket', pocket)
    }
  },
  getters: {
    totalIncome: (state) => {
      return state.income.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    totalExpenses: (state) => {
      return state.expenses.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    balance: (state, getters) => {
      return getters.totalIncome - getters.totalExpenses
    },
    getIncomePockets: state => state.incomePockets,
    getExpensePockets: state => state.expensePockets
  }
})