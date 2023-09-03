const ui = {
    prevPageButton: document.getElementById("prevPage"),
    nextPageButton: document.getElementById("nextPage"),
    currentPageDisplay: document.getElementById("currentPageDisplay"),
    loadTemplatesButton: document.getElementById("loadTemplates"),
    tableBody: document.getElementById("tableBody"),
    createTemplateForm: document.getElementById("createTemplateForm"),
    toggleEditorMode: document.getElementById("toggleEditorMode"),
    currentPage: 1,
    totalPages: 1,
    fetchedTemplates: [],

    init() {
        this.prevPageButton.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadTemplates();
            }
        });

        this.nextPageButton.addEventListener("click", () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadTemplates();
            }
        });

        document.getElementById("templateSearch").addEventListener("input", () => {
            const searchTerm = this.value.toLowerCase();
            const matchedTemplates = this.filterTemplatesBySearchTerm(searchTerm, this.fetchedTemplates);
            this.populateTable(matchedTemplates);
        });

        this.loadTemplatesButton.addEventListener("click", this.loadTemplates.bind(this));
        quillManager.updateToggleButton();

        document.getElementById("showCreateForm").addEventListener("click", () => {
            this.createTemplateForm.reset();
            quillManager.initialize();
            
            // Explicitly set the mode to false
            quillManager.isEditMode = false;
            document.getElementById("submitTemplateButton").value = "Create Template";
            // Reset the template name input and make it editable
            document.getElementById("templateName").value = "";
            document.getElementById("templateName").disabled = false;
            $('#editorModal').modal('show');
        });
        

        this.createTemplateForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const templateData = {
                TemplateName: document.getElementById("templateName").value,
                HtmlPart: quillManager.getCurrentHtmlContent(),
                TextPart: quillManager.getCurrentTextContent(),
                SubjectPart: document.getElementById("subject").value
            };            
            
            // Check if both HtmlPart and TextPart are empty
            if (!templateData.HtmlPart && !templateData.TextPart) {
                this.showAlert("Both HTML and Text content cannot be empty.", 'danger');
                return;
            }       

            // Capture the mode (edit or create) before making the API call
            const actionTaken = quillManager.isEditMode ? 'updated' : 'created';

            try {
                if (quillManager.isEditMode) {
                    await api.updateTemplate(templateData.TemplateName, templateData);
                } else {
                    await api.createTemplate(templateData);
                }

                // Reset quillManager's state
                quillManager.isEditMode = false;
                $('#editorModal').modal('hide');

                // Reset the form and other UI components after the successful form submission
                this.createTemplateForm.reset();
                quillManager.updateUI();
                document.getElementById("templateName").disabled = false;

                if (quillManager.quillEditor) {
                    quillManager.quillEditor.setText('');
                }

                this.loadTemplates();

                this.showAlert(`Template ${actionTaken} successfully`, 'success');
            } catch (error) {
                this.showAlert(error.message, 'danger');
            }
        });
        

        this.tableBody.addEventListener("click", async (event) => {
            const button = event.target.closest('button');
            if (!button) return;
        
            const templateName = button.getAttribute("data-name");
            if (button.classList.contains("edit-button")) {
                quillManager.editTemplate(templateName);
            }

            if (button.classList.contains("duplicate-button")) {
                const template = await api.fetchTemplateByName(templateName);
                document.getElementById("subject").value = template.SubjectPart;
                quillManager.initialize();
                quillManager.quillEditor.setText(template.TextPart);
                document.getElementById("templateName").value = "";
                document.getElementById("templateName").disabled = false;
                $('#editorModal').modal('show');
            }

            if (button.classList.contains("delete-button")) {
                $('#confirmDeleteModal').modal('show');
                document.getElementById('confirmDeleteButton').addEventListener('click', () => ui.handleDeleteTemplate(templateName));
            }            
        });

        $('#editorModal').on('hidden.bs.modal', () => {
            quillManager.isEditMode = false;
            quillManager.updateUI();
            document.getElementById("templateName").disabled = false;
            if (quillManager.quillEditor) {
                quillManager.currentHtmlContent = "";
                quillManager.currentTextContent = "";
                quillManager.quillEditor.setText('');
            }
        });           
    },

    async loadTemplates() {
        try {
            const templatesData = await api.fetchTemplatesByPage(this.currentPage);
            this.populateTable(templatesData.templates);
            this.updatePagination(templatesData.totalPages);
        } catch (error) {
            this.showAlert('Error fetching list of templates', 'danger');
        }
    },

    populateTable(templates) {
        this.tableBody.innerHTML = "";
        templates.forEach(template => {
            const formattedDate = new Date(template.CreatedTimestamp).toLocaleString();
            const tableRow = document.createElement("tr");
            tableRow.innerHTML = `
                <td>${template.Name}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="edit-button btn btn-warning" data-name="${template.Name}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="duplicate-button btn btn-secondary" data-name="${template.Name}">
                        <span class="material-symbols-outlined">content_copy</span>
                    </button>
                    <button class="delete-button btn btn-danger" data-name="${template.Name}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </td>
            `;
            this.tableBody.appendChild(tableRow);
        });
    },

    updatePagination(total) {
        this.totalPages = total;
        this.currentPageDisplay.textContent = `Page ${this.currentPage}`;

        if (this.currentPage <= 1) {
            this.prevPageButton.setAttribute("disabled", "disabled");
        } else {
            this.prevPageButton.removeAttribute("disabled");
        }

        if (this.currentPage >= this.totalPages) {
            this.nextPageButton.setAttribute("disabled", "disabled");
        } else {
            this.nextPageButton.removeAttribute("disabled");
        }
    },

    async handleDeleteTemplate(templateName) {
        try {
            await api.deleteTemplate(templateName);
            this.showAlert("Template deleted successfully!", 'success');
            
            // Hide the modal after the template has been successfully deleted
            $('#confirmDeleteModal').modal('hide');
            
            // If there's only one row left in the table (the one being deleted) and it's not the first page
            if (this.tableBody.children.length === 1 && this.currentPage > 1) {
                this.currentPage--;
                await this.loadTemplates();
                return;
            }
            
            // If it's not the above scenario, simply load the templates for the current page
            await this.loadTemplates();
            
        } catch (error) {
            this.showAlert("Failed to delete template!", 'danger');
        }    
    },

    showAlert(message, type) {
        const toastBody = document.querySelector("#notificationToast .toast-body");
        const toast = document.getElementById("notificationToast");

        toast.classList.remove("toast-success", "toast-danger");
    
        if (type === "success") {
            toast.classList.add("toast-success");
        } else if (type === "danger") {
            toast.classList.add("toast-danger");
        }
    
        toastBody.textContent = message;
    
        // Display the toast
        $('.toast').toast({ delay: 5000 });
        $('.toast').toast('show');
    }      
};

document.addEventListener("DOMContentLoaded", function() {
    ui.init();
});
