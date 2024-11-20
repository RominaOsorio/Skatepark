/* eslint-disable no-undef */
const actualizar = document.getElementById('btn-actualizar')
const eliminar = document.getElementById('btn-eliminar')

actualizar.addEventListener('click', (e) => {
  e.preventDefault()

  const form = document.getElementById('form-perfil')
  const formData = new FormData(form)

  fetch(form.action, {
    method: 'PUT',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la actualización del perfil')
      }
      return response.json()
    })
    .then(() => {
      window.location.href = '/dashboard'
    })
    .catch(error => {
      console.error('Error:', error)
      alert('Hubo un problema al actualizar el perfil.')
    })
})

eliminar.addEventListener('click', () => {
  const skaterId = eliminar.getAttribute('data-id')
  if (confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
    fetch(`/perfil/${skaterId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al eliminar el perfil')
        }
        return response.json()
      })
      .then(data => {
        alert(data.message)
        window.location.href = '/'
      })
      .catch(error => {
        console.error('Error:', error)
        alert('Hubo un problema al eliminar el perfil.')
      })
  }
})
