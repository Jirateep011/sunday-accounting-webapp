<template>
  <div class="transaction-form">
    <h2 class="text-center">{{ isEditing ? 'แก้ไขรายการ' : 'เพิ่มรายการ' }}</h2>
    <form @submit.prevent="submitTransaction">
      <!-- เพิ่มส่วนเลือกวันที่ -->
      <div class="mb-3">
        <label class="form-label">วันที่</label>
        <input
          type="date"
          v-model="transactionDate"
          class="form-control"
          :max="maxDate"
          required
        />
        <div class="form-text">
          วันที่ที่เลือก: {{ formatDisplayDate(transactionDate) }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">ประเภทของรายการ</label>
        <select v-model="transactionType" class="form-select" required>
          <option value="" disabled>เลือกประเภท</option>
          <option value="income">รายรับ</option>
          <option value="expense">รายจ่าย</option>
        </select>
      </div>

      <!-- เพิ่มส่วนเลือกหมวดหมู่ -->
      <div v-if="transactionType" class="mb-3">
        <label class="form-label">หมวดหมู่</label>
        <select v-model="selectedPocketId" class="form-select" required>
          <option value="" disabled>เลือกหมวดหมู่</option>
          <template v-if="transactionType === 'income'">
            <option v-for="pocket in incomePockets" :key="pocket.id" :value="pocket.id">
              {{ pocket.name }}
            </option>
          </template>
          <template v-else>
            <option v-for="pocket in expensePockets" :key="pocket.id" :value="pocket.id">
              {{ pocket.name }}
            </option>
          </template>
        </select>
      </div>

      <div class="mb-3">
        <label for="amount" class="form-label">จำนวน</label>
        <input type="number" v-model="amount" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">บันทึกช่วยจำ</label>
        <input type="text" v-model="description" class="form-control" required />
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary flex-grow-1" :disabled="!isFormValid">
          {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ' }}
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
          ยกเลิก
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { useStore } from 'vuex'

export default {
  props: {
    selectedDate: {
      type: Date,
      required: true
    },
    editingTransaction: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const store = useStore()

    // ย้ายฟังก์ชันมาไว้ด้านบนก่อนการใช้งาน
    const formatDateForInput = (date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // ฟังก์ชันสำหรับแสดงผลวันที่แบบไทย
    const formatDisplayDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const transactionType = ref(props.editingTransaction?.type || '')
    const selectedPocketId = ref(props.editingTransaction?.pocketId || '')
    const amount = ref(props.editingTransaction?.amount || null)
    const description = ref(props.editingTransaction?.description || '')
    const transactionDate = ref(
      props.editingTransaction?.date ||
      formatDateForInput(props.selectedDate) // ใช้ formatDateForInput ที่ประกาศแล้ว
    )

    const isEditing = computed(() => !!props.editingTransaction)
    const maxDate = new Date().toISOString().split('T')[0]

    // อัพเดท transactionDate เมื่อ selectedDate เปลี่ยน
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        transactionDate.value = formatDateForInput(newDate)
      }
    }, { immediate: true })

    const isFormValid = computed(() => {
      return transactionType.value &&
        selectedPocketId.value &&
        amount.value &&
        description.value
    })

    const getSelectedPocket = computed(() => {
      if (!selectedPocketId.value) return null

      const pockets = transactionType.value === 'income'
        ? incomePockets.value
        : expensePockets.value

      return pockets.find(p => p.id === selectedPocketId.value)
    })

    const resetForm = () => {
      transactionType.value = ''
      selectedPocketId.value = ''
      amount.value = null
      description.value = ''
    }

    const submitTransaction = async () => {
      try {
        const transaction = {
          id: props.editingTransaction?.id || Date.now(),
          date: transactionDate.value,
          type: transactionType.value,
          pocketId: selectedPocketId.value,
          amount: Number(amount.value),
          description: description.value
        }

        if (isEditing.value) {
          await store.dispatch('updateTransaction', transaction)
        } else {
          if (transaction.type === 'income') {
            await store.dispatch('addIncome', transaction)
          } else {
            await store.dispatch('addExpense', transaction)
          }
        }

        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `เพิ่ม${transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}เรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        resetForm()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7'
        })
      }
    }

    return {
      transactionType,
      selectedPocketId,
      amount,
      description,
      transactionDate,
      incomePockets: computed(() => store.getters.getIncomePockets),
      expensePockets: computed(() => store.getters.getExpensePockets),
      isFormValid,
      isEditing,
      submitTransaction,
      formatDisplayDate,
      maxDate
    }
  }
}
</script>

<style scoped>
.transaction-form {
  width: 100%;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-select,
.form-control {
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}

.form-select:focus,
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(108, 92, 231, 0.25);
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  font-weight: 500;
}

.btn-primary:disabled {
  background-color: #ccc;
  border-color: #ccc;
}
</style>