document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const content = document.getElementById("content");
  const btnOpen = document.getElementById("btnOpen");
  const btnCancel = document.getElementById("btnCancel");
  const pwInput = document.getElementById("pw");
  const err = document.getElementById("err");
  const bgm = document.getElementById("bgm");

  // Nếu server báo đã unlock trước đó (session), bỏ overlay
  if (typeof INITIAL_UNLOCKED !== "undefined" && INITIAL_UNLOCKED === true) {
    showContent();
  }

  // Gán sự kiện cho các nút
  btnOpen.addEventListener("click", tryUnlock);
  // Cho phép nhấn Enter để mở
  pwInput.addEventListener("keyup", (e) => { if (e.key === "Enter") tryUnlock(); });
  btnCancel.addEventListener("click", () => { window.close?.(); });

  // Hàm xử lý mở khóa
  function tryUnlock(){
    const pw = pwInput.value || "";
    err.textContent = ""; // Xóa thông báo lỗi cũ
    // Gửi mật khẩu lên server Flask qua API /unlock
    fetch("/unlock", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({password: pw})
    }).then(r => {
      // Nếu phản hồi OK (status 200), xử lý dữ liệu
      if (r.ok) return r.json();
      // Nếu lỗi (status 401), ném lỗi để bắt ở catch
      return r.json().then(j => Promise.reject(j));
    }).then(data => {
      if (data.ok) {
        showContent();
        // Cố gắng chạy nhạc nền sau khi mở khóa
        try { bgm.currentTime = 0; bgm.play().catch(()=>{}); } catch(e){}
      }
    }).catch(e => {
      // Xử lý lỗi kết nối hoặc mật khẩu sai
      const msg = (e && e.error) ? e.error : "Lỗi kết nối";
      err.textContent = msg;
      pwInput.value = "";
      pwInput.focus();
    });
  }

  // Hàm hiển thị nội dung chính
  function showContent(){
    overlay.style.display = "none";
    content.classList.remove("hidden");
    startCarousel();
  }

  // ... (Phần mã cho Carousel giữ nguyên như cũ) ...
  const slides = Array.from(document.querySelectorAll(".slide"));
  let idx = 0;
  let timer = null;
  function showSlide(i){
    slides.forEach((s, j) => s.classList.toggle("active", j===i));
  }
  function startCarousel(){
    showSlide(idx);
    timer = setInterval(() => {
      idx = (idx + 1) % slides.length;
      showSlide(idx);
    }, 4000);
  }
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  if (nextBtn) nextBtn.addEventListener("click", () => { idx = (idx+1)%slides.length; showSlide(idx); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { idx = (idx-1+slides.length)%slides.length; showSlide(idx); resetTimer(); });
  function resetTimer(){ if (timer) { clearInterval(timer); startCarousel(); } }
});
