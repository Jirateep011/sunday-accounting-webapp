<template>
  <nav :class="['navbar', { 'navbar-mobile': isMobile }]">
    <div class="navbar-container">
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">💰</div>
          <span class="brand-name">สมุดบัญชี</span>
        </div>
        <button v-if="isMobile" 
                class="navbar-toggler" 
                @click="toggleMenu"
                :aria-expanded="isMenuOpen">
          <i class="bi" :class="isMenuOpen ? 'bi-x' : 'bi-list'"></i>
        </button>
      </div>

      <div :class="['nav-links', { 'show': isMenuOpen || !isMobile }]">
        <router-link 
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.path"
          class="nav-item"
          active-class="active"
          @click="isMobile && (isMenuOpen = false)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>

  <!-- Overlay for mobile -->
  <div v-if="isMobile && isMenuOpen" 
       class="navbar-overlay"
       @click="isMenuOpen = false">
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Navbar',
  setup() {
    const isMobile = ref(false)
    const isMenuOpen = ref(false)

    const menuItems = [
      { path: '/', label: 'หน้าหลัก', icon: 'bi bi-house' },
      { path: '/income', label: 'รายรับ', icon: 'bi bi-graph-up-arrow' },
      { path: '/expenses', label: 'รายจ่าย', icon: 'bi bi-graph-down-arrow' },
      { path: '/cloudpocket', label: 'Category', icon: 'bi bi-folder' },
      { path: '/analyze', label: 'วิเคราะห์', icon: 'bi bi-bar-chart' }
    ]

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return {
      isMobile,
      isMenuOpen,
      toggleMenu,
      menuItems
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--white);
  border-right: 1px solid #eee;
  height: 100vh;
  width: var(--sidebar-width);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-mobile {
  width: 100%;
  height: var(--header-height);
  border-right: none;
  border-bottom: 1px solid #eee;
}

.navbar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  height: var(--header-height);
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 12px;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
}

.navbar-toggler {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.navbar-toggler:hover {
  background: var(--primary-light);
  color: var(--primary-color);
}

.navbar-overlay {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .navbar-mobile .nav-links {
    display: none;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: var(--white);
    padding: 1rem;
    margin-top: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .navbar-mobile .nav-links.show {
    display: flex;
  }

  .nav-item {
    padding: 1rem;
  }
}
</style>