const api = {
    async fetchTemplateByName(templateName) {
        const response = await fetch(`/ses/template/${templateName}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    },

    async fetchTemplatesByPage(pageNumber) {
        const response = await fetch(`/ses/templates?page=${pageNumber}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    },

    async createTemplate(templateData) {
        const response = await fetch(`/ses/template`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Template: templateData })
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    },

    async updateTemplate(templateName, templateData) {
        const response = await fetch(`/ses/template/${templateName}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Template: templateData })
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    },

    async deleteTemplate(templateName) {
        const response = await fetch(`/ses/template/${templateName}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
};
