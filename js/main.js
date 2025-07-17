const cards = document.querySelectorAll('.card');

console.log(cards);

cards.forEach((item) => {
  item.addEventListener('click', () => {
    // Remove active class from all cards in the same group
    const cardGroup = item.closest('.card-select');
    if (cardGroup) {
      cardGroup.querySelectorAll('.card').forEach(card => card.classList.remove('card--active'));
    }
    
    // Add active class to clicked card
    item.classList.add('card--active');
  });
});

let currentStep = 1;

function showStep(stepNumber) {
  document.querySelectorAll('.step-content').forEach(step => {
    step.style.display = 'none';
  });
  
  // Mostrar el paso actual
  document.getElementById(`step-${stepNumber}`).style.display = 'block';
  
  // Solo actualizar indicadores en la barra lateral cuando cambiamos de sección
  // Sección 1: pasos 1-7, Sección 2: pasos 8-14, etc.
  const currentSection = Math.ceil(stepNumber / 7);
  
  document.querySelectorAll('.step__number').forEach(num => {
    num.classList.remove('step--active');
  });
  
  const sectionIndicator = document.querySelector(`[data-step="${currentSection}"]`);
  if (sectionIndicator) {
    sectionIndicator.classList.add('step--active');
  }
  
  currentStep = stepNumber;
}

function nextStep() {
  if (currentStep < 7) {
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function addCollaborator(type) {
 const modalId = `modal-${type}`;
 const modal = document.getElementById(modalId);
 
 // Reset form
 const form = modal.querySelector('.modal-form');
 form.reset();
 
 // Reset card selection
 const cards = modal.querySelectorAll('.card');
 cards.forEach(card => card.classList.remove('card--active'));
 cards[0].classList.add('card--active'); // Select first card by default
 
 // Clear input values
 const inputs = modal.querySelectorAll('.input');
 inputs.forEach(input => input.value = '');
 
 modal.style.display = 'flex';
}

function closeModal(modalId) {
 document.getElementById(modalId).style.display = 'none';
}

function createCollaboratorElement(data, type) {
 const collaboratorItem = document.createElement('div');
 collaboratorItem.className = 'collaborator-item';
 
 collaboratorItem.innerHTML = `
  <div class="collaborator-avatar">
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6B7280"/>
    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#6B7280"/>
   </svg>
  </div>
  <div class="collaborator-info">
   <div class="collaborator-name">${data.nombre}</div>
   <div class="collaborator-role">${data.grado} - ${data.actividad}</div>
  </div>
  <button type="button" class="btn-remove" onclick="removeCollaborator(this)">
   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
   </svg>
  </button>
 `;
 
 return collaboratorItem;
}

function removeCollaborator(button) {
 const collaboratorItem = button.closest('.collaborator-item');
 const collaboratorList = collaboratorItem.closest('.collaborator-list');
 const collaboratorName = collaboratorItem.querySelector('.collaborator-name').textContent;
 
 // Count remaining collaborators in this list
 const remainingCollaborators = collaboratorList.querySelectorAll('.collaborator-item').length;
 
 // Prevent removing if it's the last collaborator (optional - remove this check if you want to allow empty lists)
 if (remainingCollaborators <= 1) {
  showNotification('Debe mantener al menos un colaborador en cada sección', 'error');
  return;
 }
 
 if (confirm(`¿Estás seguro de que quieres eliminar a ${collaboratorName}?`)) {
  collaboratorItem.remove();
  showNotification(`${collaboratorName} ha sido eliminado exitosamente`, 'success');
 }
}

function validateForm(modalId) {
 const modal = document.getElementById(modalId);
 const inputs = modal.querySelectorAll('.input[required], .input');
 const activeCard = modal.querySelector('.card--active');
 
 let isValid = true;
 let errors = [];
 
 inputs.forEach(input => {
  if (input.value.trim() === '') {
   isValid = false;
   errors.push(`El campo "${input.previousElementSibling.textContent}" es requerido`);
   input.style.borderColor = '#EF4444';
  } else {
   input.style.borderColor = '';
  }
 });
 
 if (!activeCard) {
  isValid = false;
  errors.push('Debe seleccionar un grado académico');
 }
 
 if (!isValid) {
  alert('Por favor corrige los siguientes errores:\n' + errors.join('\n'));
 }
 
 return isValid;
}

function addStudent() {
 if (!validateForm('modal-estudiante')) return;
 
 const modal = document.getElementById('modal-estudiante');
 const nombre = modal.querySelector('.input').value;
 const actividad = modal.querySelectorAll('.input')[1].value;
 const tipoFormacion = modal.querySelector('.select').value;
 const grado = modal.querySelector('.card--active .card__title').textContent;
 
 const studentData = {
  nombre: nombre,
  actividad: actividad,
  tipoFormacion: tipoFormacion,
  grado: grado
 };
 
 // Find the student collaborator list
 const studentSection = document.querySelector('#step-7 .form__group:last-child .collaborator-list');
 const newStudent = createCollaboratorElement(studentData, 'estudiante');
 
 studentSection.appendChild(newStudent);
 
 // Show success message
 showNotification('Estudiante agregado exitosamente', 'success');
 
 closeModal('modal-estudiante');
}

function addProfessor() {
 if (!validateForm('modal-profesor')) return;
 
 const modal = document.getElementById('modal-profesor');
 const nombre = modal.querySelector('.input').value;
 const actividad = modal.querySelectorAll('.input')[1].value;
 const grado = modal.querySelector('.card--active .card__title').textContent;
 
 const professorData = {
  nombre: nombre,
  actividad: actividad,
  grado: grado
 };
 
 // Find the professor collaborator list
 const professorSection = document.querySelector('#step-7 .form__group:first-child .collaborator-list');
 const newProfessor = createCollaboratorElement(professorData, 'profesor');
 
 professorSection.appendChild(newProfessor);
 
 // Show success message
 showNotification('Profesor agregado exitosamente', 'success');
 
 closeModal('modal-profesor');
}

function showNotification(message, type = 'success') {
 const notification = document.createElement('div');
 notification.className = `notification notification--${type}`;
 notification.textContent = message;
 
 document.body.appendChild(notification);
 
 setTimeout(() => {
  notification.remove();
 }, 3000);
}

// Counter functionality for deliverables
function incrementCounter(id) {
 const element = document.getElementById(id);
 const currentValue = parseInt(element.textContent);
 element.textContent = currentValue + 1;
}

function decrementCounter(id) {
 const element = document.getElementById(id);
 const currentValue = parseInt(element.textContent);
 if (currentValue > 0) {
  element.textContent = currentValue - 1;
 }
}

// Close modal when clicking outside
window.onclick = function(event) {
 if (event.target.classList.contains('modal')) {
  event.target.style.display = 'none';
 }
}

// Initialize form interactions
document.addEventListener('DOMContentLoaded', function() {
 // Add event listeners to modal cards
 const modalCards = document.querySelectorAll('.modal .card');
 modalCards.forEach(card => {
  card.addEventListener('click', function() {
   const cardGroup = this.closest('.card-select');
   cardGroup.querySelectorAll('.card').forEach(c => c.classList.remove('card--active'));
   this.classList.add('card--active');
  });
 });
 
 // Add required attribute to form inputs
 const requiredInputs = document.querySelectorAll('.modal .input');
 requiredInputs.forEach(input => {
  input.setAttribute('required', 'true');
 });
});