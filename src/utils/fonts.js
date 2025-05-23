import { jsPDF } from 'jspdf'

// Import fonts
import THSarabunNew from '../assets/fonts/THSarabunNew.ttf'
import THSarabunNewBold from '../assets/fonts/THSarabunNew Bold.ttf'

const addThaiFonts = () => {
  try {
    // Add normal font
    jsPDF.API.addFont(
      THSarabunNew,
      'THSarabunNew',
      'normal'
    )
    
    // Add bold font
    jsPDF.API.addFont(
      THSarabunNewBold,
      'THSarabunNew',
      'bold'
    )
  } catch (error) {
    console.error('Error loading fonts:', error)
  }
}

export default addThaiFonts