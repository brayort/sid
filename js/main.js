const cards = document.querySelectorAll('.card');
cards.forEach((item) => {
  item.addEventListener('click', () => {
    // Definir los colores para el fill
    const activeFillColor = '#007bff'; // O el color que desees para el SVG activo
    const defaultFillColor = '#656565'; // El color original del SVG

    // Remueve la clase 'card--active' de todas las tarjetas en el grupo
    // Y restaura el color de fill original del SVG para esas tarjetas
    const cardGroup = item.closest('.card-select');
    if (cardGroup) {
      cardGroup.querySelectorAll('.card').forEach(card => {
        card.classList.remove('card--active');

        // Restaurar el color de fill del SVG
        const svgPath = card.querySelector('svg path');
        if (svgPath) {
          svgPath.setAttribute('fill', defaultFillColor);
        }
      });
    }

    // Agrega la clase 'card--active' a la tarjeta clicada
    item.classList.add('card--active');

    // Cambia el color de fill del SVG en la tarjeta clicada
    const clickedSvgPath = item.querySelector('svg path');
    if (clickedSvgPath) {
      clickedSvgPath.setAttribute('fill', activeFillColor);
    }

    
    // Update hidden input value
    updateCardSelection(cardGroup, item);
  });
});

let currentStep = 1;

// Validation functions
function validateStep(stepNumber) {
  const stepElement = document.getElementById(`step-${stepNumber}`);
  const requiredFields = stepElement.querySelectorAll('[required]');
  const cardSelects = stepElement.querySelectorAll('.card-select');
  let isValid = true;
  let errors = [];

  // Clear previous error states
  stepElement.querySelectorAll('.input').forEach(input => {
    input.classList.remove('error');
  });

  // Validate required inputs
  requiredFields.forEach(field => {
    if (field.type === 'text' || field.type === 'email' || field.type === 'date') {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" es requerido`);
      } else if (field.hasAttribute('minlength') && field.value.trim().length < parseInt(field.getAttribute('minlength'))) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" debe tener al menos ${field.getAttribute('minlength')} caracteres`);
      } else if (field.hasAttribute('maxlength') && field.value.trim().length > parseInt(field.getAttribute('maxlength'))) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" no debe exceder ${field.getAttribute('maxlength')} caracteres`);
      } else if (field.hasAttribute('pattern') && !new RegExp(field.getAttribute('pattern')).test(field.value)) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El formato del campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" no es válido`);
      }
    } else if (field.tagName === 'SELECT') {
      if (!field.value) {
        isValid = false;
        field.classList.add('error');
        errors.push(`Debe seleccionar una opción en "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}"`);
      }
    } else if (field.tagName === 'TEXTAREA') {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" es requerido`);
      } else if (field.hasAttribute('minlength') && field.value.trim().length < parseInt(field.getAttribute('minlength'))) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" debe tener al menos ${field.getAttribute('minlength')} caracteres`);
      } else if (field.hasAttribute('maxlength') && field.value.trim().length > parseInt(field.getAttribute('maxlength'))) {
        isValid = false;
        field.classList.add('error');
        errors.push(`El campo "${field.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim()}" no debe exceder ${field.getAttribute('maxlength')} caracteres`);
      }
    }
  });

  // Validate radio button groups
  const radioGroups = {};
  stepElement.querySelectorAll('input[type="radio"][required]').forEach(radio => {
    if (!radioGroups[radio.name]) {
      radioGroups[radio.name] = [];
    }
    radioGroups[radio.name].push(radio);
  });

  Object.keys(radioGroups).forEach(groupName => {
    const group = radioGroups[groupName];
    const isChecked = group.some(radio => radio.checked);
    if (!isChecked) {
      isValid = false;
      const label = group[0].closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim();
      errors.push(`Debe seleccionar una opción en "${label}"`);
    }
  });

  // Validate card selections
  cardSelects.forEach(cardSelect => {
    const activeCard = cardSelect.querySelector('.card--active');
    const hiddenInput = cardSelect.closest('.form__group').querySelector('input[type="hidden"][required]');
    
    if (hiddenInput && !activeCard) {
      isValid = false;
      const label = cardSelect.closest('.form__group').querySelector('.group__label').textContent.replace('*', '').trim();
      errors.push(`Debe seleccionar una opción en "${label}"`);
    }
  });

  // Validate date ranges
  const dateInputs = stepElement.querySelectorAll('input[type="date"]');
  if (dateInputs.length === 2) {
    const startDate = new Date(dateInputs[0].value);
    const endDate = new Date(dateInputs[1].value);
    
    if (startDate >= endDate) {
      isValid = false;
      dateInputs[0].classList.add('error');
      dateInputs[1].classList.add('error');
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }

  // Validate schedule table (step 17)
  if (stepNumber === 17) {
    const scheduleRows = stepElement.querySelectorAll('#schedule-tbody .activity-row');
    if (scheduleRows.length === 0) {
      isValid = false;
      errors.push('Debe agregar al menos una actividad al cronograma');
    } else {
      scheduleRows.forEach((row, index) => {
        const activityInput = row.querySelector('.schedule-input');
        if (!activityInput.value.trim()) {
          isValid = false;
          activityInput.classList.add('error');
          errors.push(`La actividad ${index + 1} debe tener un nombre`);
        }
      });
    }
  }

  if (!isValid) {
    showNotification('Por favor corrige los errores antes de continuar:\n' + errors.join('\n'), 'error');
  }

  return isValid;
}

// Email validation
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Phone validation
function validatePhone(phone) {
  const phonePattern = /^[\d\s\-\(\)\+]{10,}$/;
  return phonePattern.test(phone);
}

// Update card selection to update hidden input
function updateCardSelection(cardSelect, selectedCard) {
  const hiddenInput = cardSelect.closest('.form__group').querySelector('input[type="hidden"]');
  if (hiddenInput) {
    hiddenInput.value = selectedCard.querySelector('.card__title').textContent;
  }
}

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
  // Validate current step before proceeding
  if (!validateStep(currentStep)) {
    return;
  }

  let nextStepNumber = currentStep + 1;
  
  // Skip step-4 if "Sin financiamiento" is selected in step-3
  if (currentStep === 3) {
    const sinFinanciamiento = document.querySelector('#sin-financiamiento');
    if (sinFinanciamiento && sinFinanciamiento.checked) {
      nextStepNumber = 5; // Skip step-4 and go directly to step-5
    }
  }
  
  // Permitir navegación hasta el paso 17 (cronograma de actividades)
  if (nextStepNumber <= 17) {
    showStep(nextStepNumber);
  }
}

function prevStep() {
  let prevStepNumber = currentStep - 1;
  
  // Skip step-4 when going back from step-5 if "Sin financiamiento" is selected
  if (currentStep === 5) {
    const sinFinanciamiento = document.querySelector('#sin-financiamiento');
    if (sinFinanciamiento && sinFinanciamiento.checked) {
      prevStepNumber = 3; // Skip step-4 and go directly to step-3
    }
  }
  
  if (prevStepNumber >= 1) {
    showStep(prevStepNumber);
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
 
 // Para estudiantes, mostrar el tipo de formación académica
 let roleText = `${data.grado} - ${data.actividad}`;
 if (type === 'estudiante' && data.tipoFormacion) {
  if (data.tipoFormacion.includes('-')) {
    data.tipoFormacion = data.tipoFormacion.replace(/-/g, ' ');
  }
  data.tipoFormacion = data.tipoFormacion.charAt(0).toUpperCase() + data.tipoFormacion.slice(1);

  roleText = `${data.grado} - ${data.actividad} (${data.tipoFormacion})`;
 }
 
 collaboratorItem.innerHTML = `
  <div class="collaborator-avatar">
  
  </div>
  <div class="collaborator-info">
   <div class="collaborator-name">${data.nombre}</div>
   <div class="collaborator-role">${roleText}</div>
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
 
 // Determinar si es la sección de estudiantes o profesores
 const step7 = document.getElementById('step-7');
 const formGroups = step7.querySelectorAll('.form__group');
 const professorSection = formGroups[0].querySelector('.collaborator-list');
 const studentSection = formGroups[1].querySelector('.collaborator-list');
 
 const isProfessorSection = collaboratorList === professorSection;
 const isStudentSection = collaboratorList === studentSection;
 
 // Cuenta el número de colaboradores restantes
 const remainingCollaborators = collaboratorList.querySelectorAll('.collaborator-item').length;
 
 // Para profesores, prevenir eliminar si solo queda uno
 if (isProfessorSection && remainingCollaborators <= 1) {
  showNotification('Debe mantener al menos un profesor en el proyecto', 'error');
  return;
 }
 
 if (confirm(`¿Estás seguro de que quieres eliminar a ${collaboratorName}?`)) {
  collaboratorItem.remove();
  showNotification(`${collaboratorName} ha sido eliminado exitosamente`, 'success');
  
  // Si es la sección de estudiantes y no quedan colaboradores, ocultar la sección
  if (isStudentSection && remainingCollaborators === 1) {
   studentSection.style.display = 'none';
  }
 }
}

function validateForm(modalId) {
 const modal = document.getElementById(modalId);
 const inputs = modal.querySelectorAll('.input[required], .input');
 const selects = modal.querySelectorAll('.select[required]');
 const activeCard = modal.querySelector('.card--active');
 
 let isValid = true;
 let errors = [];
 
 // Clear previous error states
 modal.querySelectorAll('.input, .select').forEach(field => {
   field.classList.remove('error');
 });
 
 // Validate text inputs
 inputs.forEach(input => {
  if (input.hasAttribute('required') && input.value.trim() === '') {
   isValid = false;
   errors.push(`El campo "${input.previousElementSibling.textContent}" es requerido`);
   input.classList.add('error');
  } else if (input.value.trim() !== '') {
   // Validate email if it's an email field
   if (input.type === 'email' && !validateEmail(input.value)) {
    isValid = false;
    errors.push(`El formato del email no es válido`);
    input.classList.add('error');
   }
   // Validate phone if it's a phone field
   if (input.type === 'tel' && !validatePhone(input.value)) {
    isValid = false;
    errors.push(`El formato del teléfono no es válido`);
    input.classList.add('error');
   }
   // Validate length constraints
   if (input.hasAttribute('minlength') && input.value.trim().length < parseInt(input.getAttribute('minlength'))) {
    isValid = false;
    errors.push(`El campo "${input.previousElementSibling.textContent}" debe tener al menos ${input.getAttribute('minlength')} caracteres`);
    input.classList.add('error');
   }
   if (input.hasAttribute('maxlength') && input.value.trim().length > parseInt(input.getAttribute('maxlength'))) {
    isValid = false;
    errors.push(`El campo "${input.previousElementSibling.textContent}" no debe exceder ${input.getAttribute('maxlength')} caracteres`);
    input.classList.add('error');
   }
  }
 });
 
 // Validate select fields
 selects.forEach(select => {
  if (select.hasAttribute('required') && !select.value) {
   isValid = false;
   errors.push(`Debe seleccionar una opción en "${select.previousElementSibling.textContent}"`);
   select.classList.add('error');
  }
 });
 
 // Validate card selection
 if (!activeCard) {
  isValid = false;
  errors.push('Debe seleccionar un grado académico');
 }
 
 if (!isValid) {
  showNotification('Por favor corrige los siguientes errores:\n' + errors.join('\n'), 'error');
 }
 
 return isValid;
}

function toggleStudentSection(show) {
 const step7 = document.getElementById('step-7');
 const formGroups = step7.querySelectorAll('.form__group');
 const studentSection = formGroups[1].querySelector('.collaborator-list');
 
 if (show) {
  // Mostrar la sección de estudiantes
  studentSection.style.display = 'flex';
  studentSection.style.flexDirection = 'column';
 } else {
  // Ocultar la sección de estudiantes
  studentSection.style.display = 'none';
 }
}

function addStudent() {
 if (!validateForm('modal-estudiante')) return;
 
 const modal = document.getElementById('modal-estudiante');
 const inputs = modal.querySelectorAll('.input');
 const nombre = inputs[0].value;
 const actividad = inputs[1].value;
 const tipoFormacion = modal.querySelector('.select').value;
 const grado = modal.querySelector('.card--active .card__title').textContent;
 
 const studentData = {
  nombre: nombre,
  actividad: actividad,
  tipoFormacion: tipoFormacion,
  grado: grado
 };
 
 // Encuentra la lista de colaboradores de estudiantes (la segunda form__group)
 const step7 = document.getElementById('step-7');
 const formGroups = step7.querySelectorAll('.form__group');
 const studentSection = formGroups[1].querySelector('.collaborator-list');
 const newStudent = createCollaboratorElement(studentData, 'estudiante');
 
 studentSection.appendChild(newStudent);
 
 // Mostrar la sección de estudiantes
 studentSection.style.display = 'flex';
 studentSection.style.flexDirection = 'column';
 
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
 // Remove existing notifications
 const existingNotifications = document.querySelectorAll('.notification');
 existingNotifications.forEach(notification => notification.remove());
 
 const notification = document.createElement('div');
 notification.className = `notification notification--${type}`;
 notification.textContent = message;
 
 document.body.appendChild(notification);
 
 // Auto-remove after 5 seconds
 setTimeout(() => {
  if (notification.parentElement) {
   notification.remove();
  }
 }, 5000);
}

// Enhanced character count for textareas
function addCharacterCount(textarea) {
 const maxLength = textarea.getAttribute('maxlength');
 if (!maxLength) return;
 
 const countElement = document.createElement('div');
 countElement.className = 'character-count';
 
 const updateCount = () => {
  const currentLength = textarea.value.length;
  const remaining = maxLength - currentLength;
  countElement.textContent = `${currentLength}/${maxLength} caracteres`;
  
  countElement.classList.remove('warning', 'error');
  if (remaining < 50) {
   countElement.classList.add('warning');
  }
  if (remaining < 10) {
   countElement.classList.add('error');
  }
 };
 
 textarea.addEventListener('input', updateCount);
 textarea.parentElement.appendChild(countElement);
 updateCount();
}

// Progress indicator
function updateProgress() {
 const totalSteps = 17;
 const currentProgress = Math.round((currentStep / totalSteps) * 100);
 
 // You can add a progress bar element and update it here
 console.log(`Progress: ${currentProgress}%`);
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
  // Validate final step
  if (!validateStep(currentStep)) {
    return;
  }

  // Validate that all required deliverables have at least one item
  const deliverables = document.querySelectorAll('.deliverable-count');
  let totalDeliverables = 0;
  deliverables.forEach(deliverable => {
    totalDeliverables += parseInt(deliverable.textContent);
  });

  if (totalDeliverables === 0) {
    showNotification('Debe especificar al menos un entregable para el proyecto', 'error');
    return;
  }

  // Validate that there are collaborators (at least professors)
  const step7 = document.getElementById('step-7');
  const formGroups = step7.querySelectorAll('.form__group');
  const professorList = formGroups[0].querySelector('.collaborator-list');
  
  if (!professorList.children.length) {
    showNotification('Debe agregar al menos un profesor al proyecto', 'error');
    return;
  }

  // Show loading notification
  showNotification('Validando y enviando información del proyecto...', 'success');
  
  // Simulate form submission delay
  setTimeout(() => {
    // Additional validation passed
    showNotification('Proyecto enviado exitosamente', 'success');
    
    // Redirect to confirmation page
    setTimeout(() => {
      window.location.href = 'confirmacion.html';
    }, 1500);
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
   
   // Update hidden input in modal
   updateCardSelection(cardGroup, this);
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
 
 // Real-time validation for inputs
 const allInputs = document.querySelectorAll('.input, .select');
 allInputs.forEach(input => {
  input.addEventListener('blur', function() {
   validateField(this);
  });
  
  input.addEventListener('input', function() {
   // Remove error state on input
   this.classList.remove('error');
  });
 });
 
 // Initialize card selections with hidden inputs
 const cardSelects = document.querySelectorAll('.card-select');
 cardSelects.forEach(cardSelect => {
  const activeCard = cardSelect.querySelector('.card--active');
  if (activeCard) {
   updateCardSelection(cardSelect, activeCard);
  }
 });
 
 // Initialize date validation
 const dateInputs = document.querySelectorAll('input[type="date"]');
 dateInputs.forEach(input => {
  input.addEventListener('change', function() {
   validateDateRange(this);
  });
 });
 
 // Add character count to textareas
 const textareas = document.querySelectorAll('textarea[maxlength]');
 textareas.forEach(textarea => {
  addCharacterCount(textarea);
 });
 
 // Initialize form with saved data if available
 loadFormData();
 
 // Initialize student section visibility
 const step7 = document.getElementById('step-7');
 const formGroups = step7.querySelectorAll('.form__group');
 const studentList = formGroups[1].querySelector('.collaborator-list');
 if (studentList && studentList.children.length === 0) {
  toggleStudentSection(false);
 }
 
 // Auto-save form data periodically
 setInterval(saveFormData, 30000); // Save every 30 seconds
 
 // Save form data on page unload
 window.addEventListener('beforeunload', saveFormData);
 
 // Inicializar el estado de los pasos
 showStep(1);
});

// Form data persistence
function saveFormData() {
 const formData = {};
 
 // Save all input values
 document.querySelectorAll('.input, .select, textarea').forEach(field => {
  if (field.name || field.id) {
   formData[field.name || field.id] = field.value;
  }
 });
 
 // Save radio button selections
 document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
  formData[radio.name] = radio.value;
 });
 
 // Save card selections
 document.querySelectorAll('.card--active').forEach(card => {
  const cardGroup = card.closest('.card-select');
  const groupId = cardGroup.closest('.form__group').querySelector('.group__label').textContent;
  formData[groupId] = card.querySelector('.card__title').textContent;
 });
 
 // Save deliverable counts
 document.querySelectorAll('.deliverable-count').forEach(counter => {
  formData[counter.id] = counter.textContent;
 });
 
 localStorage.setItem('sid-form-data', JSON.stringify(formData));
}

function loadFormData() {
 const savedData = localStorage.getItem('sid-form-data');
 if (!savedData) return;
 
 try {
  const formData = JSON.parse(savedData);
  
  // Restore input values
  Object.keys(formData).forEach(key => {
   const field = document.querySelector(`[name="${key}"], #${key}`);
   if (field && field.type !== 'radio') {
    field.value = formData[key];
   }
  });
  
  // Restore radio selections
  Object.keys(formData).forEach(key => {
   const radio = document.querySelector(`input[name="${key}"][value="${formData[key]}"]`);
   if (radio) {
    radio.checked = true;
   }
  });
  
  // Restore deliverable counts
  Object.keys(formData).forEach(key => {
   const counter = document.getElementById(key);
   if (counter && counter.classList.contains('deliverable-count')) {
    counter.textContent = formData[key];
   }
  });
  
  showNotification('Datos del formulario restaurados automáticamente', 'success');
 } catch (error) {
  console.error('Error loading form data:', error);
 }
}

// Clear saved data
function clearFormData() {
 localStorage.removeItem('sid-form-data');
 showNotification('Datos del formulario eliminados', 'success');
}

// Real-time field validation
function validateField(field) {
  field.classList.remove('error');
  
  if (field.hasAttribute('required') && !field.value.trim()) {
    field.classList.add('error');
    return false;
  }
  
  if (field.hasAttribute('minlength') && field.value.trim().length < parseInt(field.getAttribute('minlength'))) {
    field.classList.add('error');
    return false;
  }
  
  if (field.hasAttribute('maxlength') && field.value.trim().length > parseInt(field.getAttribute('maxlength'))) {
    field.classList.add('error');
    return false;
  }
  
  if (field.hasAttribute('pattern') && field.value.trim() && !new RegExp(field.getAttribute('pattern')).test(field.value)) {
    field.classList.add('error');
    return false;
  }
  
  if (field.type === 'email' && field.value.trim() && !validateEmail(field.value)) {
    field.classList.add('error');
    return false;
  }
  
  return true;
}

// Validate date range
function validateDateRange(dateInput) {
  const container = dateInput.closest('.form__group');
  const dateInputs = container.querySelectorAll('input[type="date"]');
  
  if (dateInputs.length === 2) {
    const startDate = new Date(dateInputs[0].value);
    const endDate = new Date(dateInputs[1].value);
    
    dateInputs.forEach(input => input.classList.remove('error'));
    
    if (startDate && endDate && startDate >= endDate) {
      dateInputs.forEach(input => input.classList.add('error'));
      showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return false;
    }
  }
  
  return true;
}

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

let radios = document.querySelectorAll('[name="financiamiento"');

let optionHTML = document.querySelector('#option-html');



radios.forEach((item, index) => {

  item.addEventListener('click', () => {
    if (index === 0) {
          optionHTML.innerHTML = `
          <div class="form__group">
          <label class="group__label">Unidad acádemica aportante</label>
          <input type="text" class="input" placeholder="Escriba la unidad acádemica" value="Universidad Autónoma de Nayarit">
          </div>

          <div class="form__group">
          <label class="group__label">Monto aprobado</label>
          <input type="text" class="input" placeholder="$ 0.00 MXN" value="$ 0.00 MXN">
          </div>
          `;
    } else if ( index === 1) {

          optionHTML.innerHTML = `
          <div class="form__group">
          <label class="group__label">Institución aportante</label>
          <input type="text" class="input" placeholder="Escriba la institución" value="Conahcyt">
          </div>

          <div class="form__group">
          <label class="group__label">Monto aprobado</label>
          <input type="text" class="input" placeholder="$ 0.00 MXN" value="$ 0.00 MXN">
          </div>
          `;
    } else {
      optionHTML.innerHTML = ``;
    }

  });
});