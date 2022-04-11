function DeleteCooKie(authorization){
    document.cookie = `${authorization}=value; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.href = './'
}

document.querySelector("#logout").addEventListener("click", function(e) {
    DeleteCooKie("authorization")
})