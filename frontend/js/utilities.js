// Function to display notifications
function showAlert(message, type, location) {
    const toast = document.getElementById('notificationToast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.classList.remove('bg-success', 'bg-danger'); // Remove existing bg classes
    toast.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
    $('#notificationToast').toast({ delay: 5000 }).toast('show');
}

function filterTemplatesBySearchTerm(searchTerm, fetchedTemplates) {
    // Flatten the templates from all pages into a single array
    const allTemplates = fetchedTemplates.flatMap(data => data.templates);

    return allTemplates.filter(template => {
        const templateName = template.Name.toLowerCase();
        return templateName.includes(searchTerm);
    });
}
