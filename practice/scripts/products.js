// scripts/products.js
import { productList as initialProducts } from "../Store/productData.js";
import { Categories, Companies, Status } from "../Store/enum.js";

/**
 * CRUD
 */
class ProductManager {
  constructor() {
    this.productList = [...initialProducts];
    this.filteredProducts = [...this.productList];
    this.currentPage = 1;
    this.rowsPerPage = 9;
    this.selectedProductIds = new Set();
    this.isEditing = false;
    this.editingIndex = null;
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupDropdowns();
    this.render();
  }

  //  INITIALIZATION 
  initializeElements() {
    // Table elements
    this.tableBody = document.getElementById("productTableBody");
    this.masterCheckbox = document.getElementById("selectAll");
    this.searchInput = document.getElementById("searchInput");
    
    // Pagination elements
    this.prevPageBtn = document.getElementById("prevPage");
    this.nextPageBtn = document.getElementById("nextPage");
    this.rowsPerPageSelect = document.getElementById("rowsPerPage");
    
    // Modal elements
    this.modal = document.getElementById('productModal');
    this.openModalBtn = document.querySelector('.add-product-btn');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.form = document.getElementById('productForm');
    
    // Form inputs
    this.nameInput = document.getElementById('productName');
    this.priceInput = document.getElementById('productPrice');
    this.imageInput = document.getElementById('productImage');
    
    // Image upload elements
    this.uploadArea = document.getElementById('uploadArea');
    this.imagePreview = document.getElementById('imagePreview');
    this.previewContainer = document.getElementById("previewContainer");
    this.uploadIcon = document.getElementById("uploadIcon");
    this.uploadText = document.getElementById("uploadText");
    this.editImageBtn = document.getElementById("editImage");
    this.deleteImageBtn = document.getElementById("deleteImage");
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput.addEventListener("input", (e) => this.handleSearch(e));
    
    // Pagination
    this.prevPageBtn.addEventListener("click", () => this.goToPrevPage());
    this.nextPageBtn.addEventListener("click", () => this.goToNextPage());
    this.rowsPerPageSelect.addEventListener("change", (e) => this.changeRowsPerPage(e));
    
    // Master checkbox
    this.masterCheckbox.addEventListener("change", () => this.toggleAllCheckboxes());
    
    // Modal controls
    this.openModalBtn.addEventListener('click', () => this.openModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    
    // Image upload
    this.setupImageUpload();
  }

  setupDropdowns() {
    this.getSelectedCategory = this.createCustomDropdown("categoryTrigger", "categoryOptions", Categories);
    this.getSelectedCompany = this.createCustomDropdown("companyTrigger", "companyOptions", Companies);
    this.getSelectedStatus = this.createCustomDropdown("statusTrigger", "statusOptions", Status);
  }

  //  SEARCH FUNCTIONALITY 
  handleSearch(e) {
    const keyword = e.target.value.trim().toLowerCase();
    
    if (keyword === "") {
      this.filteredProducts = [...this.productList];
    } else {
      this.filteredProducts = this.productList.filter(product => {
        return this.searchInProduct(product, keyword);
      });
    }
    
    this.currentPage = 1;
    this.render();
  }

  searchInProduct(product, keyword) {
    const searchFields = [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      product.price.toString(),
      product.company.toLowerCase(),
      product.status.toLowerCase()
    ];
    
    return searchFields.some(field => field.includes(keyword));
  }

  //  TABLE RENDERING 
  render() {
    this.renderTable();
    this.updatePagination();
  }

  renderTable() {
    const paginatedItems = this.getPaginatedItems();
    this.tableBody.innerHTML = "";
    
    if (paginatedItems.length === 0) {
      this.renderNoDataRow();
      return;
    }
    
    paginatedItems.forEach((product, index) => {
      const row = this.createProductRow(product, index);
      this.tableBody.appendChild(row);
    });
    
    this.updateMasterCheckboxState();
    this.attachRowEventListeners();
  }

  getPaginatedItems() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  renderNoDataRow() {
    const noDataRow = document.createElement("tr");
    noDataRow.innerHTML = `
      <td colspan="7" style="text-align: center; padding: 1rem; color: var(--text-light);">
        No data found.
      </td>
    `;
    this.tableBody.appendChild(noDataRow);
  }

  createProductRow(product, index) {
    const isChecked = this.selectedProductIds.has(product.id);
    const actualIndex = (this.currentPage - 1) * this.rowsPerPage + index;
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="padding-right: 0px;">
        ${this.createCheckboxHTML(product.id, isChecked)}
      </td>
      <td>
        ${this.createProductNameHTML(product)}
      </td>
      <td>${product.category}</td>
      <td>$ ${product.price}</td>
      <td>
        ${this.createCompanyHTML(product.company)}
      </td>
      <td>
        ${this.createStatusHTML(product.status)}
      </td>
      <td>
        ${this.createActionButtonsHTML(actualIndex)}
      </td>
    `;
    
    return row;
  }

  createCheckboxHTML(productId, isChecked) {
    return `
      <label class="custom-checkbox">
        <input type="checkbox" class="row-checkbox" data-id="${productId}" ${isChecked ? "checked" : ""}>
        <span class="checkmark"></span>
      </label>
    `;
  }

  createProductNameHTML(product) {
    return `
      <div style="display:flex; align-items:center; gap:8px">
        <div class="product-prof">
          <img src="${product.photo}" alt="product" class="table-avatar" style="margin:0px" />
        </div> 
        ${product.name}
      </div>
    `;
  }

  createCompanyHTML(company) {
    return `
      <div style="display:flex; align-items:center; gap:8px">
        <img src="assets/icons/company/${company.toLowerCase()}.svg" alt="${company}" class="table-avatar" /> 
        ${company}
      </div>
    `;
  }

  createStatusHTML(status) {
    const statusClass = status === Status.IN_STOCK ? 'positive' : 'out';
    return `<span class="status ${statusClass}">• ${status}</span>`;
  }

  createActionButtonsHTML(index) {
    return `
      <button class="action-btn edit-btn" data-index="${index}" title="Edit">
        <img src="assets/icons/pencile.svg" alt="edit" size="12px">
      </button>
      <button class="action-btn delete-btn" data-index="${index}" title="Delete">
        <img src="assets/icons/bin.svg" alt="delete" size="12px">
      </button>
    `;
  }

  //  CHECKBOX MANAGEMENT 
  attachRowEventListeners() {
    this.attachCheckboxListeners();
    this.attachActionButtonListeners();
  }

  attachCheckboxListeners() {
    document.querySelectorAll(".row-checkbox").forEach(checkbox => {
      checkbox.addEventListener("change", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.toggleProductSelection(id, e.target.checked);
      });
    });
  }

  toggleProductSelection(id, isSelected) {
    if (isSelected) {
      this.selectedProductIds.add(id);
    } else {
      this.selectedProductIds.delete(id);
    }
    this.updateMasterCheckboxState();
  }

  toggleAllCheckboxes() {
    if (this.masterCheckbox.checked) {
      this.productList.forEach(product => this.selectedProductIds.add(product.id));
    } else {
      this.selectedProductIds.clear();
    }
    this.render();
  }

  updateMasterCheckboxState() {
    const currentProducts = this.productList.slice(
      (this.currentPage - 1) * this.rowsPerPage, 
      this.currentPage * this.rowsPerPage
    );
    
    const totalOnPage = currentProducts.length;
    const checkedOnPage = currentProducts.filter(p => this.selectedProductIds.has(p.id)).length;
    const totalChecked = this.selectedProductIds.size;

    this.masterCheckbox.checked = totalChecked > 0;
    this.masterCheckbox.indeterminate = checkedOnPage > 0 && checkedOnPage < totalOnPage;

    const checkmark = this.masterCheckbox.nextElementSibling;
    checkmark.classList.toggle("indeterminate", this.masterCheckbox.indeterminate);
  }

  //  ACTION BUTTONS 
  attachActionButtonListeners() {
    this.attachDeleteButtonListeners();
    this.attachEditButtonListeners();
  }

  attachDeleteButtonListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.deleteProduct(index);
      });
    });
  }

  attachEditButtonListeners() {
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.editProduct(index);
      });
    });
  }

  deleteProduct(index) {
    const product = this.productList[index];
    if (confirm(`Are you sure you want to delete '${product.name}'?`)) {
      this.productList.splice(index, 1);
      this.selectedProductIds.delete(product.id);
      this.filteredProducts = [...this.productList];
      this.render();
    }
  }

  editProduct(index) {
    const product = this.productList[index];
    this.isEditing = true;
    this.editingIndex = index;
    
    this.populateModalForEdit(product);
    this.openModal("Edit Product");
  }

  populateModalForEdit(product) {
    this.nameInput.value = product.name;
    this.priceInput.value = product.price;
    
    this.setImagePreview(product.photo);
    
    this.selectDropdownOption("category", product.category);
    this.selectDropdownOption("company", product.company);
    this.selectDropdownOption("status", product.status);
  }

  setImagePreview(imageSrc) {
    this.imagePreview.src = imageSrc;
    this.previewContainer.classList.remove("hidden");
    this.imagePreview.classList.remove("hidden");
    this.uploadIcon.style.display = "none";
    this.uploadText.style.display = "none";
  }

  //  PAGINATION 
  updatePagination() {
    this.updatePaginationText();
    this.updatePaginationButtons();
  }

  updatePaginationText() {
    const total = this.filteredProducts.length;
    const start = (this.currentPage - 1) * this.rowsPerPage + 1;
    const end = Math.min(start + this.rowsPerPage - 1, total);

    document.getElementById("currentRange").textContent = `${start} - ${end}`;
    document.getElementById("totalCount").textContent = total;
    document.getElementById("rangeText").textContent = `${start} – ${end} of ${total}`;
  }

  updatePaginationButtons() {
    const maxPage = Math.ceil(this.filteredProducts.length / this.rowsPerPage);
    
    this.prevPageBtn.disabled = this.currentPage === 1;
    this.nextPageBtn.disabled = this.currentPage === maxPage;
    
    this.prevPageBtn.classList.toggle("disabled", this.currentPage === 1);
    this.nextPageBtn.classList.toggle("disabled", this.currentPage === maxPage);
  }

  goToPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  goToNextPage() {
    const maxPage = Math.ceil(this.filteredProducts.length / this.rowsPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.render();
    }
  }

  changeRowsPerPage(e) {
    this.rowsPerPage = parseInt(e.target.value);
    this.currentPage = 1;
    this.render();
  }

  //  MODAL MANAGEMENT 
  openModal(title = "Add New Product") {
    document.getElementById("modalName").textContent = title;
    if (title === "Add New Product") {
      this.resetModal();
    }
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.resetModal();
    this.modal.classList.add('hidden');
  }

  resetModal() {
    this.form.reset();
    this.isEditing = false;
    this.editingIndex = null;
    
    this.resetDropdownSelections();
    this.resetImageUpload();
  }

  resetDropdownSelections() {
    document.querySelectorAll(".custom-select-wrapper").forEach(wrapper => {
      const span = wrapper.querySelector("span");
      span.textContent = "Select";
      span.removeAttribute("data-value");
      span.className = "";
    });

    document.querySelectorAll(".custom-options .option").forEach(option => {
      option.classList.remove("selected");
      option.querySelector(".tick")?.classList.add("hidden");
    });
  }

  resetImageUpload() {
    this.imageInput.value = "";
    this.imagePreview.src = "";
    this.previewContainer.classList.add("hidden");
    this.uploadIcon.style.display = "block";
    this.uploadText.style.display = "block";
  }

  //  FORM HANDLING 
  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = this.validateAndGetFormData();
    if (!formData) return;

    const file = this.imageInput.files[0];
    
    if (file) {
      this.processImageAndSave(file, formData);
    } else {
      const existingImage = this.imagePreview.src;
      if (!existingImage || existingImage.includes("blank")) {
        alert("Please upload an image.");
        return;
      }
      this.saveProduct({ ...formData, photo: existingImage });
    }
  }

  validateAndGetFormData() {
    const selectedCategory = this.getSelectedCategory();
    const selectedCompany = this.getSelectedCompany();
    const selectedStatus = this.getSelectedStatus();

    if (!selectedCategory || !selectedCompany || !selectedStatus) {
      alert("Please select all dropdown fields.");
      return null;
    }

    return {
      name: this.nameInput.value,
      category: selectedCategory,
      price: parseFloat(this.priceInput.value),
      company: selectedCompany,
      status: selectedStatus
    };
  }

  processImageAndSave(file, formData) {
    const reader = new FileReader();
    reader.onload = () => {
      this.saveProduct({ ...formData, photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  saveProduct(productData) {
    const product = {
      id: this.isEditing ? this.productList[this.editingIndex].id : this.productList.length + 1,
      ...productData
    };

    if (this.isEditing) {
      this.productList[this.editingIndex] = product;
    } else {
      this.productList.push(product);
    }

    this.filteredProducts = [...this.productList];
    this.closeModal();
    this.render();
  }

  //  DROPDOWN UTILITIES 
  createCustomDropdown(triggerId, optionsId, values) {
    const trigger = document.getElementById(triggerId);
    const optionsList = document.getElementById(optionsId);
    const selectedSpan = trigger.querySelector("span");

    this.populateDropdownOptions(optionsList, values, triggerId);
    this.setupDropdownEventListeners(trigger, optionsList, selectedSpan, triggerId);

    return () => {
      const selected = selectedSpan.dataset.value;
      return selected ? selected : null;
    };
  }

  populateDropdownOptions(optionsList, values, triggerId) {
    Object.values(values).forEach(val => {
      const li = document.createElement("li");
      li.className = "option";
      li.setAttribute("data-value", val);
      li.innerHTML = this.getDropdownOptionHTML(val, triggerId);
      optionsList.appendChild(li);
    });
  }

  getDropdownOptionHTML(value, triggerId) {
    const tickIcon = '<img src="assets/icons/check.svg" class="tick hidden" />';
    
    switch (triggerId) {
      case "statusTrigger":
        const statusClass = value === "In Stock" ? "positive" : "out";
        return `<span class="change ${statusClass}">• ${value}</span> ${tickIcon}`;
      
      case "companyTrigger":
        return `<div style="display:flex; align-items:center; gap:8px">
          <img src="assets/icons/company/${value.toLowerCase()}.svg" alt="${value}" size="20px" />
          ${value}
        </div> ${tickIcon}`;
      
      default:
        return `${value} ${tickIcon}`;
    }
  }

  setupDropdownEventListeners(trigger, optionsList, selectedSpan, triggerId) {
    trigger.addEventListener("click", () => {
      optionsList.style.display = optionsList.style.display === "flex" ? "none" : "flex";
    });

    optionsList.addEventListener("click", (e) => {
      this.handleDropdownSelection(e, optionsList, selectedSpan, triggerId);
    });

    document.addEventListener("click", (e) => {
      if (!trigger.closest(".custom-select-wrapper").contains(e.target)) {
        optionsList.style.display = "none";
      }
    });
  }

  handleDropdownSelection(e, optionsList, selectedSpan, triggerId) {
    const option = e.target.closest(".option");
    if (!option) return;

    this.updateDropdownSelection(optionsList, option, selectedSpan, triggerId);
    optionsList.style.display = "none";
  }

  updateDropdownSelection(optionsList, selectedOption, selectedSpan, triggerId) {
    optionsList.querySelectorAll(".option").forEach(o => {
      o.classList.remove("selected");
      o.querySelector(".tick")?.classList.add("hidden");
    });

    selectedOption.classList.add("selected");
    selectedOption.querySelector(".tick")?.classList.remove("hidden");

    this.updateSelectedSpan(selectedSpan, selectedOption, triggerId);
  }

  updateSelectedSpan(selectedSpan, selectedOption, triggerId) {
    const value = selectedOption.dataset.value;
    selectedSpan.dataset.value = value;

    switch (triggerId) {
      case "statusTrigger":
        selectedSpan.className = value === "In Stock" ? "change positive" : "change out";
        selectedSpan.textContent = `• ${value}`;
        break;
      
      case "companyTrigger":
        selectedSpan.innerHTML = `<div style="display:flex; align-items:center; gap:8px">
          <img src="assets/icons/company/${value.toLowerCase()}.svg" alt="${value}" size="20px" />
          ${value}
        </div>`;
        break;
      
      default:
        selectedSpan.textContent = value;
    }
  }

  selectDropdownOption(type, value) {
    const trigger = document.getElementById(`${type}Trigger`);
    const options = document.getElementById(`${type}Options`).querySelectorAll(".option");
    const selectedSpan = trigger.querySelector("span");

    options.forEach(opt => {
      const optValue = opt.dataset.value;
      const tick = opt.querySelector(".tick");
      
      if (optValue === value) {
        opt.classList.add("selected");
        tick?.classList.remove("hidden");
        this.updateSelectedSpan(selectedSpan, opt, `${type}Trigger`);
      } else {
        opt.classList.remove("selected");
        tick?.classList.add("hidden");
      }
    });
  }

  //  IMAGE UPLOAD 
  setupImageUpload() {
    this.uploadArea.addEventListener("click", () => this.imageInput.click());
    this.imageInput.addEventListener("change", () => this.handleImagePreview());
    
    this.setupDragAndDrop();
    this.setupImageControls();
  }

  setupDragAndDrop() {
    this.uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.uploadArea.classList.add("drag-over");
    });
    
    this.uploadArea.addEventListener("dragleave", () => {
      this.uploadArea.classList.remove("drag-over");
    });
    
    this.uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove("drag-over");
      this.imageInput.files = e.dataTransfer.files;
      this.handleImagePreview();
    });
  }

  setupImageControls() {
    this.editImageBtn.addEventListener("click", () => this.imageInput.click());
    this.deleteImageBtn.addEventListener("click", () => this.deleteImage());
  }

  handleImagePreview() {
    const file = this.imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  deleteImage() {
    this.imageInput.value = "";
    this.previewContainer.classList.add("hidden");
    this.uploadIcon.style.display = "block";
    this.uploadText.style.display = "block";
  }
}

// Initialize the Product Manager
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});