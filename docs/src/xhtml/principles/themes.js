function toggle() {
  var menu = document.querySelector('#button-menu');
  var buttons = menu.querySelectorAll('button');
  gui.Array.from(buttons).forEach(function(b) {
    b.disabled = !b.disabled;
  });
}

function change(radio) {
  var colorRegex = /ts-bg-([a-z]*) /i;
  var newColor = radio.value + ' ';
  
  var menu = document.querySelector('#button-menu');
  menu.className = newColor;
  
  var htmlClass = document.documentElement.className;
  if (htmlClass.indexOf('ts-bg-') !== -1) {
    document.documentElement.className = htmlClass.replace(colorRegex, newColor);
  } else {
    document.documentElement.className += ' ' + newColor;
  }

  var mainClass = document.querySelector('main').className;
  if (mainClass.indexOf('ts-bg-') !== -1) {
    document.querySelector('main').className = mainClass.replace(colorRegex, newColor);
  } else {
    document.querySelector('main').className += ' ' + newColor;
  }

  switch(true) {
    case contains(radio.value, 'lite'):
      ts.ui.TopBar.lite();
      break;
    case contains(radio.value, 'blue'):
      ts.ui.TopBar.blue();
      break;
    case contains(radio.value, 'dark'):
      ts.ui.TopBar.dark();
      break;
    case contains(radio.value, 'red'):
      ts.ui.TopBar.red();
      break;
    case contains(radio.value, 'yellow'):
      ts.ui.TopBar.yellow();
      break;
    case contains(radio.value, 'green'):
      ts.ui.TopBar.green();
      break;
    case contains(radio.value, 'white'):
      ts.ui.TopBar.white();
      break;
    case contains(radio.value, 'purple'):
      ts.ui.TopBar.purple();
      break;
  }
}
function contains(mystring, term){
  return mystring.indexOf(term) > -1;
}
