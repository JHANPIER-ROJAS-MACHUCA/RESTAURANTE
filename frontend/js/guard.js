(function(){

const token=
localStorage.getItem(
'accessToken'
);

const usuario=
localStorage.getItem(
'usuario'
);

if(!token || !usuario){

window.location.replace(
'login.html'
);

}

})();