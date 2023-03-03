const SignInBtn = document.querySelector("#sign-in-btn");
const SignUpBtn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const SignInBtn2 = document.querySelector("#sign-in-btn2");
const SignUpBtn2 = document.querySelector("#sign-up-btn2");

SignUpBtn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});
SignInBtn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});
SignUpBtn2.addEventListener("click", () => {
  container.classList.add("sign-up-mode2");
});
SignInBtn2.addEventListener("click", () => {
  container.classList.remove("sign-up-mode2");
});
