// Sélectionne l'icône de notification et le pop-up
const notifIcon = document.querySelector(".notif-icon");
const notifPopup = document.querySelector(".pop-up-nitif");

// Affiche le pop-up lorsque la souris passe sur l'icône
notifIcon.addEventListener("mouseover", () => {
    notifPopup.style.display = "block";
});

// Cache le pop-up lorsque la souris quitte l'icône ou le pop-up lui-même
notifIcon.addEventListener("mouseout", (e) => {
    if (!notifPopup.contains(e.relatedTarget)) {
        notifPopup.style.display = "none";
    }
});

notifPopup.addEventListener("mouseleave", () => {
    notifPopup.style.display = "none";
});
