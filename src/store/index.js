import { createStore } from 'vuex'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default createStore({
  state() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      token: localStorage.getItem('token') || null,
      income: [],
      expenses: [],
      incomePockets: [],
      expensePockets: []
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    setIncome(state, income) {
      state.income = income
    },
    setExpenses(state, expenses) {
      state.expenses = expenses
    },
    addIncome(state, incomeEntry) {
      state.income.push(incomeEntry)
    },
    addExpense(state, expenseEntry) {
      state.expenses.push(expenseEntry)
    },
    deleteIncome(state, id) {
      state.income = state.income.filter(item => item._id !== id)
    },
    deleteExpense(state, id) {
      state.expenses = state.expenses.filter(item => item._id !== id)
    },
    updateIncome(state, updatedIncome) {
      const index = state.income.findIndex(item => item._id === updatedIncome._id)
      if (index !== -1) {
        state.income.splice(index, 1, updatedIncome)
      }
    },
    updateExpense(state, updatedExpense) {
      const index = state.expenses.findIndex(item => item._id === updatedExpense._id)
      if (index !== -1) {
        state.expenses.splice(index, 1, updatedExpense)
      }
    },
    clearTransactions(state) {
      state.income = []
      state.expenses = []
    }
  },
  actions: {
    async register({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, credentials)
        const { user, token } = response.data.data
        commit('setUser', user)
        commit('setToken', token)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Registration failed')
      }
    },
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        const { user, token } = response.data.data
        commit('setUser', user)
        commit('setToken', token)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed')
      }
    },
    logout({ commit }) {
      commit('clearAuth')
      commit('clearTransactions')
    },
    async fetchIncome({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/income`)
        commit('setIncome', response.data)
      } catch (error) {
        console.error('Error fetching income:', error)
      }
    },
    async fetchExpenses({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/expenses`)
        commit('setExpenses', response.data)
      } catch (error) {
        console.error('Error fetching expenses:', error)
      }
    },
    async addIncome({ commit }, incomeEntry) {
      try {
        const response = await axios.post(`${API_URL}/income`, incomeEntry)
        commit('addIncome', response.data)
      } catch (error) {
        console.error('Error adding income:', error)
      }
    },
    async addExpense({ commit }, expenseEntry) {
      try {
        const response = await axios.post(`${API_URL}/expenses`, expenseEntry)
        commit('addExpense', response.data)
      } catch (error) {
        console.error('Error adding expense:', error)
      }
    },
    async deleteIncome({ commit }, id) {
      try {
        await axios.delete(`${API_URL}/income/${id}`)
        commit('deleteIncome', id)
      } catch (error) {
        console.error('Error deleting income:', error)
      }
    },
    async deleteExpense({ commit }, id) {
      try {
        await axios.delete(`${API_URL}/expenses/${id}`)
        commit('deleteExpense', id)
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    },
    async updateIncome({ commit }, income) {
      try {
        const response = await axios.put(`${API_URL}/income/${income._id}`, income)
        commit('updateIncome', response.data)
      } catch (error) {
        console.error('Error updating income:', error)
      }
    },
    async updateExpense({ commit }, expense) {
      try {
        const response = await axios.put(`${API_URL}/expenses/${expense._id}`, expense)
        commit('updateExpense', response.data)
      } catch (error) {
        console.error('Error updating expense:', error)
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    totalIncome: (state) => {
      return state.income.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    totalExpenses: (state) => {
      return state.expenses.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    balance: (state, getters) => {
      return getters.totalIncome - getters.totalExpenses
    }
  }
})