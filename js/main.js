const cards = document.querySelectorAll('.card');

console.log(cards);

cards.forEach((item) => {
  item.addEventListener('click', () => {
    // Remueve la clase 'card--active' de todas las tarjetas en el grupo
    const cardGroup = item.closest('.card-select');
    if (cardGroup) {
      cardGroup.querySelectorAll('.card').forEach(card => card.classList.remove('card--active'));
    }

    // Agrega la clase 'card--active' a la tarjeta clicada
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
  
  // Actualizar indicadores en la barra lateral basado en las secciones
  let currentSection;
  if (stepNumber >= 1 && stepNumber <= 7) {
    currentSection = 1; // Información general
  } else if (stepNumber >= 8 && stepNumber <= 13) {
    currentSection = 2; // Protocolo de investigación
  } else if (stepNumber >= 14 && stepNumber <= 14) {
    currentSection = 3; // Resultados de propuesta
  } else if (stepNumber >= 15 && stepNumber <= 16) {
    currentSection = 4; // Impactos de propuesta
  } else if (stepNumber >= 17 && stepNumber <= 17) {
    currentSection = 5; // Cronograma de actividades
  }
  
  // Actualizar el estado de todos los pasos
  updateStepIndicators(currentSection);
  
  currentStep = stepNumber;
}

function updateStepIndicators(currentSection) {
  document.querySelectorAll('.step__number').forEach((num, index) => {
    const stepNumber = index + 1;
    
    // Remover todas las clases de estado
    num.classList.remove('step--active', 'step--completed');
    
    if (stepNumber < currentSection) {
      // Pasos completados - azul sólido
      num.classList.add('step--completed');
    } else if (stepNumber === currentSection) {
      // Paso actual - azul activo
      num.classList.add('step--active');
    }
    // Los pasos futuros mantienen el estilo por defecto (gris)
  });
}

function nextStep() {
  // Permitir navegación hasta el paso 17 (cronograma de actividades)
  if (currentStep < 17) {
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
 
 // Cuenta el número de colaboradores restantes
 const remainingCollaborators = collaboratorList.querySelectorAll('.collaborator-item').length;
 
 // Previene eliminar si solo queda un colaborador
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
 
 // Encuentra la lista de colaboradores de estudiantes
 const studentSection = document.querySelector('#step-7 .form__group:last-child .collaborator-list');
 const newStudent = createCollaboratorElement(studentData, 'estudiante');
 
 studentSection.appendChild(newStudent);
 
 // Muestra mensaje de éxito
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
 
 // Encuentra la lista de colaboradores de profesores
 const professorSection = document.querySelector('#step-7 .form__group:first-child .collaborator-list');
 const newProfessor = createCollaboratorElement(professorData, 'profesor');
 
 professorSection.appendChild(newProfessor);

 // Muestra mensaje de éxito
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

// Funciones para incrementar y decrementar contadores
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

// Funciones para el cronograma de actividades
function addActivity() {
  const tbody = document.getElementById('schedule-tbody');
  const activityCount = tbody.children.length + 1;
  
  const newRow = document.createElement('tr');
  newRow.className = 'activity-row';
  newRow.innerHTML = `
    <td>
      <input type="text" class="schedule-input" placeholder="Actividad ${activityCount}" value="">
    </td>
    <td>
      <input type="text" class="schedule-input" placeholder="Descripción de la actividad" value="">
    </td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td><input type="checkbox" class="period-checkbox"></td>
    <td>
      <button type="button" class="btn-remove-activity" onclick="removeActivity(this)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </td>
  `;
  
  tbody.appendChild(newRow);
  showNotification('Actividad agregada exitosamente', 'success');
}

function removeActivity(button) {
  const row = button.closest('.activity-row');
  const tbody = document.getElementById('schedule-tbody');
  const activityName = row.querySelector('.schedule-input').value || 'esta actividad';
  
  // Prevenir eliminar si solo queda una actividad
  if (tbody.children.length <= 1) {
    showNotification('Debe mantener al menos una actividad en el cronograma', 'error');
    return;
  }
  
  if (confirm(`¿Estás seguro de que quieres eliminar ${activityName}?`)) {
    row.remove();
    showNotification('Actividad eliminada exitosamente', 'success');
  }
}

function submitForm() {
  // Show loading notification
  showNotification('Enviando información del proyecto...', 'success');
  
  // Simulate form submission delay
  setTimeout(() => {
    // Redirect to confirmation page
    window.location.href = 'confirmacion.html';
  }, 2000);
}

// Cierrar modal al hacer clic fuera de él
window.onclick = function(event) {
 if (event.target.classList.contains('modal')) {
  event.target.style.display = 'none';
 }
}

// Inicializar el primer paso al cargar la página
document.addEventListener('DOMContentLoaded', function() {
 // Cargar event listeners para los botones de navegación
 const modalCards = document.querySelectorAll('.modal .card');
 modalCards.forEach(card => {
  card.addEventListener('click', function() {
   const cardGroup = this.closest('.card-select');
   cardGroup.querySelectorAll('.card').forEach(c => c.classList.remove('card--active'));
   this.classList.add('card--active');
  });
 });
 
 // Agregar event listeners a los números de paso para navegación
 const stepNumbers = document.querySelectorAll('.step__number');
 stepNumbers.forEach(stepNumber => {
  stepNumber.addEventListener('click', function() {
   const sectionNumber = parseInt(this.getAttribute('data-step'));
   navigateToSection(sectionNumber);
  });
 });
 
 // añadir atributo required a los inputs dentro de los modales
 const requiredInputs = document.querySelectorAll('.modal .input');
 requiredInputs.forEach(input => {
  input.setAttribute('required', 'true');
 });
 
 // Inicializar el estado de los pasos
 showStep(1);
});

// Función para navegar directamente a una sección haciendo clic en el número
function navigateToSection(sectionNumber) {
  // Solo permitir navegación a secciones completadas o la sección actual
  const currentSection = getCurrentSection();
  
  if (sectionNumber <= currentSection) {
    // Determinar el primer paso de la sección seleccionada
    let targetStep;
    switch(sectionNumber) {
      case 1: targetStep = 1; break;
      case 2: targetStep = 8; break;
      case 3: targetStep = 14; break;
      case 4: targetStep = 15; break;
      case 5: targetStep = 17; break;
      default: targetStep = 1;
    }
    
    showStep(targetStep);
    
    // Mostrar notificación de navegación
    const sectionNames = [
      '', 'Información general', 'Protocolo de investigación', 
      'Resultados de propuesta', 'Impactos de propuesta', 'Cronograma de actividades'
    ];
    
    if (sectionNumber !== currentSection) {
      showNotification(`Navegando a: ${sectionNames[sectionNumber]}`, 'success');
    }
  } else {
    // Mostrar mensaje si intenta navegar a una sección futura
    showNotification('Complete la sección actual para continuar', 'error');
  }
}

// Función auxiliar para obtener la sección actual
function getCurrentSection() {
  if (currentStep >= 1 && currentStep <= 7) return 1;
  if (currentStep >= 8 && currentStep <= 13) return 2;
  if (currentStep >= 14 && currentStep <= 14) return 3;
  if (currentStep >= 15 && currentStep <= 16) return 4;
  if (currentStep >= 17 && currentStep <= 17) return 5;
  return 1;
}