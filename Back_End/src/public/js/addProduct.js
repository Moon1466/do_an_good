const addProductButton = document.getElementById("addProduct");
const modalAddProduct = document.getElementById("modal_addProduct");
const closeModalButton = document.getElementById("closeModal");

ClassicEditor
.create(document.querySelector('#description'))
.catch(error => {
  console.error(error)
});
  
addProductButton.addEventListener("click", () => {
    console.log("Add Product button clicked");
    modalAddProduct.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
    console.log("Close Modal button clicked");
    modalAddProduct.style.display = "none";
});