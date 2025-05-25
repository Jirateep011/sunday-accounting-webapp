<template>
  <nav :class="['navbar', { 'navbar-mobile': isMobile }]">
    <div class="navbar-container">
      <!-- Brand Section -->
      <div class="brand-section">
        <router-link to="/" class="brand-content">
          <div class="logo-wrapper">
            <div class="logo">💰</div>
          </div>
          <span class="brand-name">Keepi</span>
        </router-link>
        <button v-if="isMobile" 
                class="navbar-toggler" 
                @click="toggleMenu"
                :aria-expanded="isMenuOpen">
          <i class="bi" :class="isMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div :class="['nav-links', { 'show': isMenuOpen || !isMobile }]">
        <router-link 
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.path"
          class="nav-item"
          active-class="active"
          @click="isMobile && (isMenuOpen = false)"
        >
          <div class="nav-icon">
            <i :class="item.icon"></i>
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>

  <!-- Mobile Overlay -->
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
  background: var(--navbar-background-color);
  border-right: 1px solid rgba(0,0,0,0.05);
  height: 100vh;
  width: var(--sidebar-width);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);
}

.navbar-mobile {
  width: 100%;
  height: var(--header-height);
  border-right: none;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.navbar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 1rem;
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.brand-content:hover {
  background: var(--primary-light);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  font-size: 1.5rem;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.brand-content:hover .logo {
  transform: scale(1.05);
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--navbar-text-color);
}

/* Navigation Links */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  color: var(--navbar-text-color);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.nav-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: var(--primary-light);
  color: var(--navbar-text-color);
}

.nav-item:hover .nav-icon {
  background: var(--white);
  color: var(--navbar-text-color);
}

.nav-item.active {
  background: var(--white);
  color: #5B3A1B;
}

.nav-item.active .nav-icon {
  background: rgba(255,255,255,0.2);
}

/* Mobile Styling */
.navbar-toggler {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-toggler:hover {
  background: var(--primary-light);
  color: var(--navbar-text-color);
}

.navbar-overlay {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 999;
}

@media (max-width: 768px) {
  .navbar {
    width: 100%;
    height: var(--header-height);
    border-right: none;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .navbar-container {
    padding: 0.5rem 1rem;
  }

  .brand-section {
    margin-bottom: 0;
  }

  .navbar-mobile .nav-links {
    display: none;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: var(--white);
    padding: 1rem;
    gap: 0.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .navbar-mobile .nav-links.show {
    display: flex;
  }

  .nav-item {
    padding: 0.75rem 1rem;
  }
}
</style>