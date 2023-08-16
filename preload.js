window.addEventListener('DOMContentLoaded', (ev) => {
    console.log(`DOMContentLoaded`)

    try {
        document.querySelector(`*[id="nb-add"]`).remove()
        document.querySelector(`*[id="nb-edit"]`).remove()
        document.querySelector(`*[id="nb-delete"]`).remove()

        document.querySelector(`*[id="footer"]`).remove()

        document.querySelector(`div[class="footrow"]`).remove()
        document.querySelector(`div[class="viewlinks row"]`).remove()
        document.querySelector(`div[class="row"]`).remove()
    }
    catch (e) {
        //
    }
})