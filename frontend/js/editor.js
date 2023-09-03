
class QuillEditorManager {
    constructor(editorContainerId, modalTitleId, submitButtonSelector) {
        this.editorContainerId = editorContainerId;
        this.modalTitleId = modalTitleId;
        this.submitButtonSelector = submitButtonSelector;
        
        this.isEditMode = false;
        this.currentEditingTemplateName = "";
        this.quillEditor = null;
        this.quillInitialized = false;
        this.isHtmlMode = false;
        this.currentHtmlContent = "";
        this.currentTextContent = "";
        document.getElementById("toggleEditorMode").addEventListener("click", this.toggleContentMode);
    }

    initialize() {
        
        if (this.quillInitialized) return;
        
        const toolbarOptions = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 
                                { 'list': 'ordered'}, { 'list': 'bullet' }, 
                                { 'script': 'sub'}, { 'script': 'super' }, 
                                { 'align': [] }, 'clean'];

        this.quillEditor = new Quill(`#${this.editorContainerId}`, { 
            modules: { toolbar: toolbarOptions }, 
            theme: 'snow' 
        });
        
        this.quillInitialized = true;
        document.querySelector(`#${this.editorContainerId} .ql-editor`).style.height = '400px';
    }

    updateUI() {
        const modalTitle = document.getElementById(this.modalTitleId);
        const submitButton = document.querySelector(this.submitButtonSelector);
        
        modalTitle.textContent = this.isEditMode ? "Edit Template" : "Create Template";
        submitButton.value = this.isEditMode ? "Update Template" : "Create Template";
    }

    toggleActionMode() {
        this.isEditMode = !this.isEditMode;
        this.updateUI();
    }

    toggleContentMode = () => {
        if (!this.quillEditor) return;
        
        if (this.isHtmlMode) {
            this.currentHtmlContent = this.quillEditor.root.innerHTML.trim();
            this.isHtmlMode = false;
            this.quillEditor.setText(this.currentTextContent);
        } else {
            this.currentTextContent = this.quillEditor.getText().trim();
            this.isHtmlMode = true;
            this.quillEditor.root.innerHTML = this.currentHtmlContent;
        }
        this.updateToggleButton();
    }

    toggleEditMode() {
        if (this.isHtmlMode) {
            // Switch to visual mode
            this.quillEditor.root.innerHTML = this.currentHtmlContent;
            this.isHtmlMode = false;
        } else {
            // Switch to raw HTML mode
            this.currentHtmlContent = this.quillEditor.root.innerHTML;
            this.currentTextContent = this.quillEditor.getText();
            this.quillEditor.setText(this.currentHtmlContent);
            this.isHtmlMode = true;
        }
    }

    updateToggleButton() {
        const toggleButton = document.getElementById("toggleEditorMode");
        if (this.isHtmlMode) {
            toggleButton.textContent = "Toggle Plain-Text";
        } else {
            toggleButton.textContent = "Toggle HTML";
        }
    }

    getCurrentHtmlContent() {
        return this.isHtmlMode ? this.quillEditor.root.innerHTML.trim() : this.currentHtmlContent.trim();
    }
    
    getCurrentTextContent() {
        return this.isHtmlMode ? this.currentTextContent.trim() : this.quillEditor.getText().trim();
    }

    async editTemplate(templateName) {
        const template = await api.fetchTemplateByName(templateName);
        document.getElementById("subject").value = template.SubjectPart;
        this.initialize();
        this.isEditMode = true;
        this.currentEditingTemplateName = templateName;
        document.getElementById("templateName").value = templateName;
        document.getElementById("templateName").disabled = true;
    
        // Store both the HTML and Text contents
        this.currentHtmlContent = template.HtmlPart;
        this.currentTextContent = template.TextPart;
    
        // Populate the editor based on the current mode
        if (this.isHtmlMode) {
            this.quillEditor.root.innerHTML = this.currentHtmlContent;
        } else {
            this.quillEditor.setText(this.currentTextContent);
        }
        this.updateUI();
        $('#editorModal').modal('show');
    }

    async duplicateTemplate(templateName) {
        const template = await api.fetchTemplateByName(templateName);
        document.getElementById("subject").value = template.SubjectPart;
        this.initialize();
        this.isEditMode = false;
        if (this.quillEditor) {
            if (this.isHtmlMode) {
                this.quillEditor.root.innerHTML = template.HtmlPart;
            } else {
                this.quillEditor.setText(template.TextPart);
            }
        }
        document.getElementById("templateName").value = "";
        document.getElementById("templateName").disabled = false;
        this.updateUI();
        $('#editorModal').modal('show');
    }
}

const quillManager = new QuillEditorManager('editorContainer', 'editorModalLabel', 'input[type="submit"]');
