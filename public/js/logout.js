function GetCookie(authorization){
    let CookieArray = document.cookie.split(";");
    for(let i = 0; i < CookieArray.length; i++) {
        const cookie = CookieArray[i]
        if (cookie.indexOf(authorization) != -1) {
            document.cookie = `${authorization}=value; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
    }
    window.location.href = './'
}

document.querySelector("#logout").addEventListener("click", function(e) {
    GetCookie("authorization")
})