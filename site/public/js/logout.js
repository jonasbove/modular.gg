function deleteCookie(type){
    document.cookie = `${type}=value; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.href = './'
}

document.querySelector("#logout").addEventListener("click", function(e) {
    deleteCookie("authorization")
})