

const cards = document.querySelectorAll('.card');

console.log(cards);

      cards.forEach((item) => {
         item.addEventListener('click', () => {
        
          item.classList.toggle('card--active');
        
         })
        });