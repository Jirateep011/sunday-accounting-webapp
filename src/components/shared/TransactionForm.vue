<template>
  <div class="transaction-form">
    <h2 class="text-center">เพิ่มรายการ</h2>
    <form @submit.prevent="submitTransaction">
      <div class="mb-3">
        <label for="transactionType" class="form-label">ประเภทของรายการ</label>
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

      <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
        {{ isFormValid ? 'ยืนยัน' : 'กรุณากรอกข้อมูลให้ครบ' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import { useStore } from 'vuex'

export default {
  props: {
    selectedPocket: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const store = useStore()
    const transactionType = ref('')
    const selectedPocketId = ref('')
    const amount = ref(null)
    const description = ref('')

    // ตัวอย่างข้อมูลหมวดหมู่ (ควรย้ายไปเก็บใน Vuex store)
    const incomePockets = computed(() => store.getters.getIncomePockets)
    const expensePockets = computed(() => store.getters.getExpensePockets)

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
      if (!isFormValid.value) return

      try {
        const transaction = {
          type: transactionType.value,
          amount: Number(amount.value),
          description: description.value,
          pocketId: props.selectedPocket?.id || selectedPocketId.value,
          date: new Date().toISOString()
        }

        if (transaction.type === 'income') {
          store.dispatch('addIncome', transaction)
        } else {
          store.dispatch('addExpense', transaction)
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
      incomePockets,
      expensePockets,
      isFormValid,
      submitTransaction
    }
  }
}
</script>

<style scoped>
.transaction-form {
  max-width: 400px;
  margin: auto;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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