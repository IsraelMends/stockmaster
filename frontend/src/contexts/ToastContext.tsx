// Este arquivo está mantido apenas para compatibilidade
// Agora estamos usando react-hot-toast diretamente
import toast from 'react-hot-toast'

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  switch (type) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'info':
      toast(message)
      break
  }
}

// Wrapper para compatibilidade
export function useToastContext() {
  return {
    showToast,
  }
}
