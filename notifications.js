export function notify(message, type = "success") {
  const notif = document.createElement("div");
  notif.className = `notif ${type}`;
  notif.innerText = message;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("show");
  }, 100);

  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}
