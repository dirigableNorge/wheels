const mainMenu = document.getElementById('mainMenu');

window.addEventListener('scroll', (evt) => {
  console.log(pageYOffset);
  mainMenu.classList.add('page-header__menu--stick');
  if (pageYOffset === 0){
    mainMenu.classList.remove('page-header__menu--stick');
  }
});
